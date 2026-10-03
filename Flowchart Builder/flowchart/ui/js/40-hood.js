// ---------------------------------------------------------------------------
//  40-hood.js -- more than one house: starting another asks whether it
//  takes the old one's place or goes next door, and the houses stand side
//  by side along one street, as far apart as asked (and the made-up
//  neighbors too)
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // (asked for, 2026-10-02: "if you are designing a house and you can start
  // another new house and it will ask do you want to remove the old house
  // or do you want to add a second (or third house etc) to the
  // neighborhood", and "let you set the distance you have for the
  // neighbors houses")
  //
  // Start a house (39-starter.js) put a second house to the right of all
  // there was, its floors upstairs too -- far along, its lot's front not on
  // the first's street.  Now, with a house there already, it asks first:
  // in its place (one step to Undo), or next door.  Next door, each house's
  // lot follows the last along the street, fronts in a line, as far apart
  // as houseOpt "gap" says (metres between lots); the floors over and
  // under every house in a row of their own past them, on the paper -- in
  // 3D they stand on their houses wherever they are drawn (floorsOf,
  // 38-walk.js).  The houses next door that are only scenery (worldHood,
  // 39-world.js) keep the same distance, and keep off the lots of real ones.
  HOUSE_PLAIN.gap = 0;
  var HOOD_GAP_MOST = 30;
  function hoodGap() { var g = +houseOpt("gap"); return g > 0 ? Math.min(HOOD_GAP_MOST, g) : 0; }

  function hoodBox(list) {
    var b = { l: Infinity, r: -Infinity, t: Infinity, b: -Infinity };
    list.forEach(function (n) {
      var q = turned(n);
      b.l = Math.min(b.l, n.x - q.w / 2); b.r = Math.max(b.r, n.x + q.w / 2);
      b.t = Math.min(b.t, n.y - q.h / 2); b.b = Math.max(b.b, n.y + q.h / 2);
    });
    return b;
  }
  function hoodMove(list, dx, dy) { list.forEach(function (n) { n.x = Math.round(n.x + dx); n.y = Math.round(n.y + dy); }); }
  function hoodHouseCount() {
    var lots = hand.nodes.filter(function (n) { return n.kind === "i_lot"; }).length;
    return lots || (hand.nodes.some(function (n) { return n.kind === "i_room"; }) ? 1 : 0);
  }
  // The houses along their street: each lot, and what stands in it; the
  // floors over and under, in a row past them.
  function hoodRespace() {
    var P = FLOOR_PX, floors = typeof floorsOf === "function" ? floorsOf() : [];
    var uppers = floors.filter(function (f) { return f.level !== 0; }).map(function (f) { return f.n; });
    var held = new Map();                               // what is in each floor over or under
    uppers.forEach(function (c) { held.set(c, hand.nodes.filter(function (n) { return n !== c && insideArea(c, n.x, n.y); })); });
    var upperSet = new Set();
    uppers.forEach(function (c) { upperSet.add(c); held.get(c).forEach(function (n) { upperSet.add(n); }); });
    var lots = hand.nodes.filter(function (n) { return n.kind === "i_lot" && !upperSet.has(n); }).sort(function (a, b) { return a.x - b.x; });
    var ground = hand.nodes.filter(function (n) { return !upperSet.has(n); });
    // each house's ground floor drawn no wider than what is on it, its
    // middle kept (the floors over it stand square on it): two side by
    // side must not overlap on the paper, or a floor is taken for another's
    floors.filter(function (f) { return f.level === 0; }).forEach(function (f) {
      var c = f.n, on = hand.nodes.filter(function (n) { return n !== c && n.kind !== "i_lot" && n.kind !== "i_floor" && insideArea(c, n.x, n.y); });
      if (!on.length) { return; }
      var b = hoodBox(on), half = Math.max(c.x - b.l, b.r - c.x) + 0.4 * P;
      if (half < c.w / 2) { c.w = Math.round(2 * half); }
    });
    if (lots.length > 1) {
      var members = lots.map(function (lot) {
        return ground.filter(function (n) { return n !== lot && n.kind !== "i_lot" && insideArea(lot, n.x, n.y); });
      });
      // what a house takes up on the paper: its ground floor, or its rooms
      function reach(list) {
        var frames = list.filter(function (n) { return n.kind === "i_floor"; });
        return hoodBox(frames.length ? frames : list.filter(function (n) { return n.kind === "i_room"; }));
      }
      var front = lots[0].y + lots[0].h / 2, right = lots[0].x + lots[0].w / 2, gap = hoodGap() * P;
      var taken = reach(members[0]).r;
      for (var i = 1; i < lots.length; i++) {
        // (what is in two lots at once goes with the first)
        var mine = members[i].filter(function (n) { for (var k = 0; k < i; k++) { if (members[k].indexOf(n) >= 0) { return false; } } return true; });
        var lot = lots[i], ext = reach(mine), dy = front - (lot.y + lot.h / 2);
        var dx = right + gap - (lot.x - lot.w / 2);
        if (ext.l !== Infinity) { dx = Math.max(dx, taken + 20 - ext.l); }
        hoodMove([lot].concat(mine), dx, dy);
        right = lot.x + lot.w / 2;
        if (ext.r !== -Infinity) { taken = ext.r + dx; }
      }
    }
    if (!uppers.length) { return; }
    var g = hoodBox(ground), cursor = g.r + 240;
    uppers.slice().sort(function (a, b) { return a.x - b.x; }).forEach(function (c) {
      var dx = cursor - (c.x - c.w / 2), dy = g.t - (c.y - c.h / 2);
      hoodMove([c].concat(held.get(c)), dx, dy);
      cursor += c.w + 240;
    });
  }
  function hoodRedraw() {
    if (typeof tieSeen !== "undefined") { tieSeen = { H: null, key: null, J: null }; }
    if (typeof handKeep === "function") { handKeep(); }
    if (typeof drawHand === "function") { drawHand(); }
    if (typeof houseFresh === "function") { houseFresh(); }
  }

  // ---- asked, when there is a house already ---------------------------------------------
  function hoodAsk(go) {
    var n = hoodHouseCount() + 1;
    var sheet = document.createElement("div");
    sheet.className = "make-sheet st-sheet hood-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-labelledby", "hood-title");
    var card = document.createElement("div");
    card.className = "make-card st-card hood-card";
    card.innerHTML = '<h2 id="hood-title"></h2><p class="make-sub"></p><div class="hood-picks">' +
      '<button type="button" class="hood-pick hood-add"><span class="hood-ico"></span><b></b><span></span></button>' +
      '<button type="button" class="hood-pick hood-replace"><span class="hood-ico"></span><b></b><span></span></button></div>' +
      '<div class="st-go"><button type="button" class="btn small st-no"></button></div>';
    card.querySelector("h2").textContent = TXT.hd_title;
    card.querySelector(".make-sub").textContent = TXT.hd_sub;
    var add = card.querySelector(".hood-add"), rep = card.querySelector(".hood-replace");
    add.querySelector(".hood-ico").innerHTML = houseIcon("hood");
    add.querySelector("b").textContent = TXT.hd_add;
    add.querySelector("span:last-child").textContent = say("hd_add_sub", { n: n });
    rep.querySelector(".hood-ico").innerHTML = houseIcon("hd_replace");
    rep.querySelector("b").textContent = TXT.hd_replace;
    rep.querySelector("span:last-child").textContent = TXT.hd_replace_sub;
    card.querySelector(".st-no").textContent = TXT.in_cancel;
    var gone = false;
    function shut() {
      if (gone) { return; }
      gone = true;
      if (typeof STILL !== "undefined" && STILL) { sheet.remove(); return; }
      sheet.classList.add("going");
      setTimeout(function () { sheet.remove(); }, 200);
    }
    card.querySelector(".st-no").onclick = shut;
    add.onclick = function () { shut(); go("add"); };
    rep.onclick = function () { shut(); go("replace"); };
    sheet.addEventListener("keydown", function (ev) { if (ev.key === "Escape") { ev.preventDefault(); ev.stopPropagation(); shut(); } });
    sheet.addEventListener("pointerdown", function (ev) { if (ev.target === sheet) { shut(); } });
    sheet.appendChild(card);
    document.body.appendChild(sheet);
    setTimeout(function () { add.focus({ preventScroll: true }); }, 30);
  }
  if (typeof starterWrap === "function") {
    starterWrap(function* (inner, want) {
      var here = hand.nodes.some(function (n) { return n.kind === "i_room"; });
      if (!here || (want && want.where === "add-quiet")) { return yield* hoodBuild(inner, want); }
      if (want && want.where === "replace") { return yield* hoodReplace(inner, want); }
      if (want && want.where === "add") { return yield* hoodAdd(inner, want); }
      // (asked: made once the answer comes, a slice at a time like the rest)
      hoodAsk(function (how) {
        var steps = how === "replace" ? hoodReplace(inner, want) : hoodAdd(inner, want);
        (typeof starterLive === "function" ? starterLive : starterDrive)(steps);
      });
      return undefined;
    });
  }
  // Made, and marked with what it was made from -- on its lot, else its
  // ground floor, else its first room -- for Change this house… (40-edit.js).
  function* hoodBuild(inner, want) {
    var before = hand.next, out = yield* inner(want);
    try {
      var made = hand.nodes.filter(function (n) { return n.id >= before; });
      var mark = made.filter(function (n) { return n.kind === "i_lot"; })[0] ||
                 made.filter(function (n) { return n.kind === "i_floor" && /ground/i.test(String(n.text || "")); })[0] ||
                 made.filter(function (n) { return n.kind === "i_floor"; }).sort(function (a, b) { return a.x - b.x; })[0] ||
                 made.filter(function (n) { return n.kind === "i_room"; })[0];
      if (mark && want) {
        var keep = JSON.parse(JSON.stringify(want));
        delete keep.where;
        mark.madeWith = keep;
      }
      // and what was asked for in its yard (40-yard.js)
      if (typeof yardMake === "function") { yardMake(want, made); yield ["yard", 1]; }
    } catch (e) { /* made, not marked */ }
    return out;
  }
  // In its place: the drawing cleared and the new house made -- one step to Undo.
  function* hoodReplace(inner, want) {
    keepUndo();
    var keepHouse = hand.house ? Object.assign({}, hand.house) : null;
    hand.nodes = []; hand.links = [];
    if (keepHouse) { hand.house = keepHouse; }
    var undoWas = keepUndo, out;
    keepUndo = function () { };
    try { out = yield* hoodBuild(inner, want); } finally { keepUndo = undoWas; }
    return out;
  }
  // Next door: made (to the right of everything, as it always was), then
  // put along the street.
  function* hoodAdd(inner, want) {
    var out = yield* hoodBuild(inner, want);
    try { hoodRespace(); hoodRedraw(); } catch (e) { /* where it was made */ }
    if (typeof handSaysSoft === "function") { handSaysSoft(say("hd_added", { n: hoodHouseCount() })); }
    return out;
  }

  // ---- the made-up neighbors keep off real lots ---------------------------------------------
  if (typeof worldNeighbor === "function") {
    var worldNeighborHood = worldNeighbor;
    worldNeighbor = function (v, L, s, W) {
      try {
        if (!s.back && L.lot && L.lotLocal) {
          var taken = hand.nodes.some(function (n) {
            if (n.kind !== "i_lot" || n === L.lot) { return false; }
            var q = L.lotLocal([n.x, n.y]);
            return Math.abs(q[0] - s.x) < W / 2 + n.w / 2 - 1 && Math.abs(q[1]) < L.lot.h;
          });
          if (taken) { return; }
        }
      } catch (e) { /* draw it */ }
      return worldNeighborHood.apply(this, arguments);
    };
  }
  if (typeof houseSceneKey === "function") {
    var houseSceneKeyHood = houseSceneKey;
    houseSceneKey = function () {
      var lots = hand.nodes.filter(function (n) { return n.kind === "i_lot"; }).map(function (n) { return [n.x, n.y, n.w, n.h].map(Math.round).join(","); });
      return houseSceneKeyHood.apply(this, arguments) + "|g" + hoodGap() + "|" + lots.join(";");
    };
  }

  // ---- how far apart: on the Street tab -----------------------------------------------------
  if (typeof HOUSE_ICONS === "object") {
    HOUSE_ICONS.hd_replace = '<path d="M3.5 9.5 10 4l6.5 5.5V16h-13z"/><path d="M7.5 9.5l5 5M12.5 9.5l-5 5"/>';
    HOUSE_ICONS.hd_gap = '<path d="M2.5 11 6 8l3.5 3v5h-7zM10.5 11 14 8l3.5 3v5h-7z"/><path d="M8.5 5h3M8.5 5l1-1M8.5 5l1 1M11.5 5l-1-1M11.5 5l-1 1"/>';
  }
  function hoodGapRow(sheet, redraw) {
    var head = document.createElement("div");
    head.className = "v3-mats-head";
    head.textContent = TXT.hd_gap_head;
    sheet.appendChild(head);
    var row = document.createElement("div");
    row.className = "st-step hood-gap";
    row.innerHTML = houseIcon("hd_gap") + '<span class="st-step-name"></span><span class="st-step-ctl">' +
      '<button type="button" class="st-step-btn hood-less"><svg viewBox="0 0 14 14"><path d="M3 7h8"/></svg></button><output></output>' +
      '<button type="button" class="st-step-btn hood-more"><svg viewBox="0 0 14 14"><path d="M3 7h8M7 3v8"/></svg></button></span>';
    row.querySelector(".st-step-name").textContent = TXT.hd_gap;
    row.title = TXT.hd_gap_tip;
    var g = hoodGap(), step = typeof feetHere === "function" && feetHere() ? 0.9144 * 2 : 2;    // 6 ft, or 2 m
    row.querySelector("output").textContent = typeof lenSay === "function" ? lenSay(g) : g + " m";
    var less = row.querySelector(".hood-less"), more = row.querySelector(".hood-more");
    less.setAttribute("aria-label", TXT.st_fewer + ": " + TXT.hd_gap);
    more.setAttribute("aria-label", TXT.st_more + ": " + TXT.hd_gap);
    less.disabled = g <= 0; more.disabled = g >= HOOD_GAP_MOST;
    function set(v) {
      houseSetOpt("gap", Math.max(0, Math.min(HOOD_GAP_MOST, Math.round(v * 100) / 100)));
      try { hoodRespace(); hoodRedraw(); } catch (e) { /* the neighbors only */ }
      redraw();
    }
    less.onclick = function () { set(g - step); };
    more.onclick = function () { set(g + step); };
    sheet.appendChild(row);
  }
  // (after the street lamps' picker, as the power lines are: 40-utility.js)
  if (typeof worldPicker === "function") {
    var worldPickerHood = worldPicker;
    worldPicker = function (sheet, keys, now, prefix) {
      var out = worldPickerHood.apply(this, arguments);
      if (prefix === "wl_" && typeof WORLD_LAMPS !== "undefined" && keys === WORLD_LAMPS) {
        try {
          var redraw = sheet.redraw || (V3 && V3.box && el(".v3-set", V3.box) && el(".v3-set", V3.box).redraw);
          hoodGapRow(sheet, function () { if (redraw) { redraw(); } });
        } catch (e) { /* the sheet without it */ }
      }
      return out;
    };
  }
