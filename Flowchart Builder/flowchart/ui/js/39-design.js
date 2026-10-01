// ---------------------------------------------------------------------------
//  39-design.js -- what is being made, a flowchart or a design; and a
//  design's own tools, panel, sizes, limits and Tidy up
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ======================================================= what is made ==
  // (asked for, 2026-10-02: "have it ask what you are designing and if you
  // pick Flowchart it gives the flowchart stuff but if you pick design it
  // gives you the design stuff and it hides the text and code buttons")
  //
  // Drawing by hand makes one of two things.  A flowchart is a program: it
  // has the Text and Code tabs beside it, runs step by step, and is written
  // out.  A design -- a floor plan, a team, a network, a circuit, a sky --
  // is none of that, and the panel says so: the tabs, As text, the code and
  // its tests go, and what a design wants comes forward -- the icons, sizes
  // in feet and metres, Tidy up that puts furniture straight.  Each keeps a
  // paper of its own, so switching from one to the other puts the first
  // away, Undo and all, and brings the other back as it was left.
  var MAKING_AWAY = "flowchart-hand-away";   // the paper not being worked on
  var undoAway = null;                       // and its Undo and Redo

  // What a paper is: what it was said to be, or else what is on it -- more
  // icons than flowchart shapes is a design -- or nothing yet.
  function makingOf(h) {
    if (!h) { return ""; }
    if (h.making === "design" || h.making === "flowchart") { return h.making; }
    var icons = 0, steps = 0;
    (h.nodes || []).forEach(function (n) {
      if (ICONS[n.kind]) { icons++; } else if (!BOARD_NEUTRAL[n.kind]) { steps++; }
    });
    return !icons && !steps ? "" : icons && icons >= steps ? "design" : "flowchart";
  }
  function makingNow() { return makingOf(hand); }
  function designMode() { return byHand && makingNow() === "design"; }

  // Arrows mean something in a design of wires, cables, hand-offs, roads
  // or a rocket's flight; in a floor plan they do not -- the stairs find
  // each other without them -- and nothing there offers to draw them.
  function linksWanted() {
    return !designMode() || boardName() !== "home";
  }

  function awayPaper() {
    try {
      var a = JSON.parse(localStorage.getItem(MAKING_AWAY));
      return a && a.hand && a.hand.nodes ? a : null;
    } catch (e) { return null; }
  }
  function keepAway(paper) {
    try {
      if (paper && paper.nodes.length) {
        localStorage.setItem(MAKING_AWAY, JSON.stringify({ making: makingOf(paper), hand: paper }));
      } else { localStorage.removeItem(MAKING_AWAY); }
    } catch (e) { /* this visit only */ }
  }

  // Making the other thing: this paper put away with its Undo, and the
  // other one -- kept from before, or a clean sheet -- taken out.
  function setMaking(kind) {
    if (kind !== "design" && kind !== "flowchart") { return; }
    if (typeof closeMenu === "function") { closeMenu(); }
    var now = makingNow(), swapped = false;
    if (now !== kind) {
      var away = awayPaper(), mine = hand.nodes.length ? JSON.parse(JSON.stringify(hand)) : null;
      if (mine) { mine.making = now; }
      if (mine || (away && away.making === kind)) {
        hand = away && away.making === kind ? away.hand : { nodes: [], links: [], next: 1, nextLink: 0 };
        keepAway(mine);
        var undo = { was: wasLike.splice(0), will: willBeLike.splice(0) };
        if (undoAway) {
          Array.prototype.push.apply(wasLike, undoAway.was);
          Array.prototype.push.apply(willBeLike, undoAway.will);
        }
        undoAway = undo;
        showUndo();
        swapped = true;
      }
    }
    hand.making = kind;
    picked = chosen = null;
    many = [];
    joining = false;
    if (kind === "design" && !byHand) {
      setMode(true);                     // straight to the paper: nothing to carry over from the text
    } else if (byHand) {
      drawAdders(); drawHand(); drawHandPanel(); showReport();
    }
    handKeep();
    dressMaking();
    if (swapped && hand.nodes.length && el("#fit")) { el("#fit").click(); }
  }

  // The page dressed for what is being made (09-design.css does the rest).
  function dressMaking() {
    var design = designMode();
    document.body.classList.toggle("designing", design);
    var seg = el("#making");
    if (seg) {
      all(".seg-btn", seg).forEach(function (b) {
        var on = b.dataset.making === (design ? "design" : "flowchart");
        b.classList.toggle("on", on);
        b.setAttribute("aria-checked", on ? "true" : "false");
      });
    }
    // what Run can be told the drawing is: no "program" in a design
    var pick = el("#r-board"), opt = pick && pick.querySelector('option[value="program"]');
    if (opt) { opt.hidden = design; opt.disabled = design; }
    if (pick && design && pick.value === "program") { pick.value = "auto"; }
    dressBrand();
  }

  // The name over the paper.  Build gives it a program's title (09-build.js)
  // -- and the page builds its starting example out of sight, so a house
  // was headed "Age Check".  A design is headed with what it is ("Floor
  // plan", "Circuit"), "Design" under it; the program's title comes back
  // with the flowchart, the newest one if Build ran in between.
  var brandWas = null;
  function designName() {
    var b = boardName();
    return (b !== "program" && b !== "flow" && TXT["bd_" + b]) || TXT.dz_design;
  }
  function dressBrand() {
    var box = el(".brand"), t = box && box.firstChild, sub = el("#sub");
    if (!t || t.nodeType !== 3) { return; }
    if (designMode()) {
      var name = designName();
      if (t.textContent !== name) {
        brandWas = t.textContent === TXT.dz_design || BRAND_NAMES[t.textContent] ? brandWas : t.textContent;
        t.textContent = name;
      }
      if (sub) {
        var said = TXT.dz_design + " · " + sub.textContent.split(" · ").slice(1).join(" · ");
        if (sub.textContent.indexOf(" · ") > 0 && sub.textContent !== said) { sub.textContent = said; }
      }
    } else if (brandWas !== null) {
      t.textContent = brandWas;
      brandWas = null;
    }
  }
  // every heading a design can have, so one is never kept as a program's
  var BRAND_NAMES = {};
  ["home", "team", "network", "circuit", "space", "city"].forEach(function (b) {
    if (TXT["bd_" + b]) { BRAND_NAMES[TXT["bd_" + b]] = true; }
  });
  // Build heads the page whenever it runs; while designing it is put back.
  // (Written only when it differs, so the watcher's own write ends there.)
  if (el(".brand") && typeof MutationObserver === "function") {
    new MutationObserver(function () {
      if (designMode()) { dressBrand(); }
    }).observe(el(".brand"), { childList: true, characterData: true, subtree: true });
  }

  // ---- the switch at the top of the panel ----------------------------------
  var MAKING_ART = {
    flowchart: '<rect x="6.5" y="1.8" width="7" height="3.6" rx="1.8"/><path d="M10 5.4v2.2"/>' +
               '<rect x="5.5" y="7.6" width="9" height="3.6" rx=".6"/><path d="M10 11.2v1.6"/>' +
               '<path d="M10 12.8l3.4 2.6L10 18l-3.4-2.6z"/>',
    design: '<path d="M2.8 3h14.4v14H2.8z"/><path d="M10 3v6.5M10 13v4M2.8 9.5h4.6M12.6 9.5h4.6"/>' +
            '<path d="M7.4 9.5a2.6 2.6 0 0 1 2.6 2.6"/><rect x="12" y="12.6" width="4" height="3" rx=".6"/>'
  };
  function makingArt(kind, cls) {
    return '<svg class="' + (cls || "mk-art") + '" viewBox="0 0 20 20" aria-hidden="true">' + MAKING_ART[kind] + "</svg>";
  }
  (function makingSwitch() {
    var card = el("#modes");
    if (!card || el("#making")) { return; }
    var seg = document.createElement("div");
    seg.id = "making";
    seg.className = "seg making";
    seg.setAttribute("role", "radiogroup");
    seg.setAttribute("data-w-aria", "dz_making");
    seg.setAttribute("aria-label", TXT.dz_making);
    [["flowchart", "dz_flowchart", "dz_flowchart_tip"], ["design", "dz_design", "dz_design_tip"]].forEach(function (one) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "seg-btn making-btn";
      b.dataset.making = one[0];
      b.setAttribute("role", "radio");
      b.setAttribute("data-w-title", one[2]);
      b.title = TXT[one[2]];
      b.innerHTML = makingArt(one[0]) + '<span data-w="' + one[1] + '"></span>';
      b.lastChild.textContent = TXT[one[1]];
      b.onclick = function () { setMaking(one[0]); };
      seg.appendChild(b);
    });
    card.insertBefore(seg, card.firstChild);
    if (typeof tendSeg === "function") { tendSeg(seg); }
    dressMaking();
  })();

  // ---- asked, when there is nothing on the paper yet ------------------------
  function askMaking() {
    if (el(".make-sheet")) { return; }
    var sheet = document.createElement("div");
    sheet.className = "make-sheet";
    sheet.setAttribute("role", "dialog");
    sheet.setAttribute("aria-modal", "true");
    sheet.setAttribute("aria-labelledby", "make-title");
    var card = document.createElement("div");
    card.className = "make-card";
    card.innerHTML = '<h2 id="make-title"></h2><p class="make-sub"></p><div class="make-picks"></div>' +
                     '<button type="button" class="btn small make-later"></button>';
    card.querySelector("h2").textContent = TXT.dz_ask;
    card.querySelector(".make-sub").textContent = TXT.dz_ask_sub;
    var picks = card.querySelector(".make-picks");
    [["flowchart", "dz_flowchart", "dz_flow_says", "dz_flow_eg"],
     ["design", "dz_design", "dz_design_says", "dz_design_eg"]].forEach(function (one) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "make-pick";
      b.dataset.making = one[0];
      b.innerHTML = '<span class="make-pic">' + makingArt(one[0], "make-art") + '</span><strong></strong>' +
                    '<span class="make-says"></span><small></small>';
      b.querySelector("strong").textContent = TXT[one[1]];
      b.querySelector(".make-says").textContent = TXT[one[2]];
      b.querySelector("small").textContent = TXT[one[3]];
      b.onclick = function () { shut(); setMaking(one[0]); };
      picks.appendChild(b);
    });
    var later = card.querySelector(".make-later");
    later.textContent = TXT.dz_later;
    later.onclick = function () { shut(); };
    sheet.appendChild(card);
    document.body.appendChild(sheet);
    var buttons = all(".make-pick", card);
    sheet.addEventListener("keydown", function (ev) {
      var at = buttons.indexOf(document.activeElement);
      if (ev.key === "Escape") { shut(); }
      else if ((ev.key === "ArrowRight" || ev.key === "ArrowDown") && at >= 0) { buttons[(at + 1) % 2].focus(); }
      else if ((ev.key === "ArrowLeft" || ev.key === "ArrowUp") && at >= 0) { buttons[(at + 1) % 2].focus(); }
      else { return; }
      ev.preventDefault();
      ev.stopPropagation();
    });
    sheet.addEventListener("pointerdown", function (ev) { if (ev.target === sheet) { shut(); } });
    setTimeout(function () { buttons[0].focus({ preventScroll: true }); }, 30);
    var gone = false;
    function shut() {
      if (gone) { return; }
      gone = true;
      if (typeof STILL !== "undefined" && STILL) { sheet.remove(); return; }
      sheet.classList.add("going");
      setTimeout(function () { sheet.remove(); }, 200);
    }
  }

  // ---- going to the paper -----------------------------------------------------
  // An empty paper with nothing said about it asks what it is for.
  var setModeMaking = setMode;
  setMode = function (toHand) {
    var out = setModeMaking.apply(this, arguments);
    dressMaking();
    if (byHand && !hand.nodes.length && !hand.making && !el(".make-sheet")) { askMaking(); }
    return out;
  };
  // A design kept with nothing on it yet is still a design, coming back.
  var handRecallPlain = handRecall;
  handRecall = function () {
    var got = handRecallPlain.apply(this, arguments);
    if (!got) {
      try {
        var kept = JSON.parse(localStorage.getItem("flowchart-hand"));
        if (kept && (kept.making === "design" || kept.making === "flowchart") && !hand.nodes.length) {
          hand.making = kept.making;
          return kept.making === "design";
        }
      } catch (e) { /* nothing kept */ }
    }
    return got;
  };
  // A design is never redrawn from the text: the text is a flowchart's.
  if (typeof pseudoToHand === "function") {
    var pseudoToHandMaking = pseudoToHand;
    pseudoToHand = function () {
      if (makingOf(hand) === "design") { return Promise.resolve(false); }
      return pseudoToHandMaking.apply(this, arguments);
    };
  }

  // ==================================================== lengths, typed ==
  // A size is said as a builder says it -- 3' 4" in US English, 1.25 m
  // elsewhere -- and taken as any of the ways one is written: 3'4", 3 ft
  // 4 in, 40", 3.5 (feet, or metres), 1.2 m, 120 cm.
  function lenSay(m) {
    if (feetHere()) {
      var inch = Math.round(m / 0.0254), ft = Math.floor(inch / 12), i = inch - ft * 12;
      return ft ? ft + "'" + (i ? " " + i + '"' : "") : i + '"';
    }
    var v = Math.round(m * 100) / 100;
    try { return v.toLocaleString(LANG, { maximumFractionDigits: 2 }) + " m"; }
    catch (e) { return v + " m"; }
  }
  function lenRead(text) {
    var s = String(text || "").trim().toLowerCase().replace(/,/g, ".")
      .replace(/[′’]/g, "'").replace(/[″”]/g, '"');
    if (!s) { return NaN; }
    var m = /^(\d+(?:\.\d+)?)\s*(?:'|ft|feet|foot)\s*(\d+(?:\.\d+)?)\s*(?:"|in|inch|inches)?$/.exec(s);
    if (m) { return (+m[1] * 12 + +m[2]) * 0.0254; }
    m = /^(\d+(?:\.\d+)?)\s*(mm|cm|m|metres?|meters?|metros?|mètres?|'|ft|feet|foot|"|in|inch|inches)?$/.exec(s);
    if (!m) { return NaN; }
    var v = +m[1], u = m[2] || (feetHere() ? "ft" : "m");
    if (u === "mm") { return v / 1000; }
    if (u === "cm") { return v / 100; }
    if (u.charAt(0) === "m") { return v; }
    if (u === "'" || u.charAt(0) === "f") { return v * 0.3048; }
    return v * 0.0254;
  }
  function lenStep(big) { return feetHere() ? (big ? 0.3048 : 0.0254) : (big ? 0.1 : 0.01); }

  // ================================================ nothing outgrows ==
  // (asked for, 2026-10-02: "somethings should not be able to get bigger
  // than one another")  A piece of furniture is no wider or deeper than the
  // room it stands in, inside its walls; what stands on something is no
  // bigger than what it stands on; nothing is taller than the ceiling over
  // it; and a room is never made too small for what is in it, or its
  // ceiling lower than the tallest thing under it.  Each limit says why.
  function roomAround(n) {               // the smallest room it stands in
    var best = null;
    hand.nodes.forEach(function (r) {
      if (r === n || r.kind !== "i_room" || !insideArea(r, n.x, n.y)) { return; }
      if (n.kind === "i_room" && r.w * r.h <= n.w * n.h) { return; }
      if (!best || r.w * r.h < best.w * best.h) { best = r; }
    });
    return best;
  }
  function quarter(n) {                  // 0 upright, 1 a quarter round, null at a slant
    var t = (((n.turn || 0) % 360) + 360) % 360;
    return t % 90 ? null : (t / 90) % 2;
  }
  function innerOf(room, at) {           // a room's floor, inside its walls (paper's axes)
    var T = roomWallOf(room), r = turned(at ? { kind: room.kind, w: at.w, h: at.h, turn: room.turn } : room);
    var x = at ? at.x : room.x, y = at ? at.y : room.y;
    return { l: x - r.w / 2 + T, r: x + r.w / 2 - T, t: y - r.h / 2 + T, b: y + r.h / 2 - T };
  }
  function supportOf(n) {                // what it stands on
    var best = null, top = -1;
    hand.nodes.forEach(function (m) {
      if (m === n || !isSolid(m.kind) || !insideArea(m, n.x, n.y)) { return; }
      var h = pieceHigh(m);
      if (h > top) { top = h; best = m; }
    });
    return best;
  }
  function roomCalled(room) { return roomLabel(room) || kindName("i_room"); }
  function keepsToRoom(n) {              // a piece that stands inside a room's walls
    return isLoose(n.kind) && !isArea(n.kind) && !SNAP_IN_WALL[n.kind] && n.kind !== "i_wall" &&
           n.kind !== "i_fence";
  }
  function heldBy(room, at) {            // what stands in a room (as it was, at `at`)
    var box = at ? { kind: room.kind, x: at.x, y: at.y, w: at.w, h: at.h, turn: room.turn } : room;
    return hand.nodes.filter(function (m) {
      return m !== room && !isArea(m.kind) && !SNAP_IN_WALL[m.kind] && insideArea(box, m.x, m.y) &&
             (!at ? roomAround(m) === room : true);
    });
  }

  function limitsOf(n) {
    var P = FLOOR_PX;
    var L = { w: [0.05, 400], h: [0.05, 400], tall: [0.02, 12], ceil: [1.8, 12], lift: [0, 12], drop: [0.05, 12],
             setback: [0, 100], why: {} };
    if (!ICONS[n.kind]) { return L; }
    var room = roomAround(n), q = quarter(n), ceil = room ? ceilOf(room) : null;
    if (room && keepsToRoom(n) && q !== null && quarter(room) === 0) {
      var f = innerOf(room), across = (f.r - f.l) / P, down = (f.b - f.t) / P;
      L.w[1] = q ? down : across;
      L.h[1] = q ? across : down;
      L.why.w = L.why.h = say("dz_fits_room", { room: roomCalled(room), size: lenSay(L.w[1]) + " × " + lenSay(L.h[1]) });
    }
    if (ON_TOP[n.kind]) {
      var s = supportOf(n);
      if (s && quarter(s) !== null && q !== null) {
        var ts = turned(s), mw = (q ? ts.h : ts.w) / P, mh = (q ? ts.w : ts.h) / P;
        var says = say("dz_fits_on", { what: labelName(s.kind) });
        if (mw < L.w[1]) { L.w[1] = mw; L.why.w = says; }
        if (mh < L.h[1]) { L.h[1] = mh; L.why.h = says; }
      }
    }
    if (room && ceil) {
      if (V3_WALL[n.kind]) {
        var hang = wallHang(n);
        L.tall[1] = Math.max(0.02, ceil - hang[0]);
        L.lift[1] = Math.max(0, ceil - (hang[1] - hang[0]));
      } else if (FROM_CEILING[n.kind]) {
        L.drop[1] = Math.max(0.1, ceil - 0.1);
        L.tall[1] = Math.max(0.02, Math.min(hangDrop(n)[0], ceil - 0.1));
      } else if (ON_TOP[n.kind]) {
        var under = supportOf(n);
        L.tall[1] = Math.max(0.02, ceil - (under ? pieceHigh(under) : 0));
      } else {
        L.tall[1] = ceil;
      }
      L.why.tall = L.why.lift = L.why.drop = say("dz_under_ceiling", { room: roomCalled(room), size: lenSay(ceil) });
    }
    if (n.kind === "i_room") {
      var T = roomWallOf(n), most = [0, 0], top = 0, tallest = null;
      heldBy(n).forEach(function (m) {
        var tm = turned(m), stands = ON_TOP[m.kind] && supportOf(m);
        if (keepsToRoom(m)) { most[0] = Math.max(most[0], tm.w); most[1] = Math.max(most[1], tm.h); }
        var hi = V3_WALL[m.kind] ? wallHang(m)[1] : FROM_CEILING[m.kind] ? 0 :
                 (stands ? pieceHigh(stands) : 0) + pieceHigh(m);
        if (hi > top) { top = hi; tallest = m; }
      });
      var rq = quarter(n);
      if (rq !== null && (most[0] || most[1])) {
        L.w[0] = ((rq ? most[1] : most[0]) + 2 * T) / P;
        L.h[0] = ((rq ? most[0] : most[1]) + 2 * T) / P;
        L.why.w = L.why.h = say("dz_holds", { size: lenSay(L.w[0]) + " × " + lenSay(L.h[0]) });
      }
      L.why.ceil = say("dz_ceil_least", { size: lenSay(L.ceil[0]) });
      if (tallest && top + 0.02 > L.ceil[0]) {
        L.ceil[0] = top + 0.02;
        L.why.ceil = say("dz_above", { what: labelName(tallest.kind), size: lenSay(top) });
      }
    }
    return L;
  }

  // Back inside its room's walls, where it fits there.
  function keepIn(n) {
    var room = roomAround(n);
    if (!room || !keepsToRoom(n) || quarter(room) !== 0 || quarter(n) === null) { return false; }
    var f = innerOf(room), t = turned(n);
    if (t.w > f.r - f.l + 0.5 || t.h > f.b - f.t + 0.5) { return false; }
    var x = Math.min(Math.max(n.x, f.l + t.w / 2), f.r - t.w / 2);
    var y = Math.min(Math.max(n.y, f.t + t.h / 2), f.b - t.h / 2);
    if (Math.abs(x - n.x) < 0.01 && Math.abs(y - n.y) < 0.01) { return false; }
    n.x = Math.round(x * 2) / 2; n.y = Math.round(y * 2) / 2;
    return true;
  }

  // Grown by a corner on the paper (06-chart.js): no further than its room's
  // wall the way it is going, and a room no smaller than what is in it --
  // from the corner held still (`how`: which way, that corner, and where
  // and how big it was).
  function sizeLimited(n, how) {
    if (!byHand || !ICONS[n.kind]) { return; }
    var P = FLOOR_PX, L = limitsOf(n);
    var maxW = L.w[1] * P, maxH = L.h[1] * P, minW = L.w[0] * P, minH = L.h[0] * P;
    var q = quarter(n);
    if (how && q !== null) {
      var room = roomAround(n);
      if (room && keepsToRoom(n) && quarter(room) === 0) {
        var f = innerOf(room), across = how.ax > 0 ? f.r - how.fx : how.fx - f.l, down = how.ay > 0 ? f.b - how.fy : how.fy - f.t;
        // along its own sides: a quarter round, across is its depth
        maxW = Math.min(maxW, q ? down : across);
        maxH = Math.min(maxH, q ? across : down);
      }
      if (n.kind === "i_room" && how.was && q === 0) {
        var T = roomWallOf(n);
        heldBy(n, how.was).forEach(function (m) {
          if (!keepsToRoom(m)) { return; }
          var tm = turned(m);
          var reachX = how.ax > 0 ? m.x + tm.w / 2 - how.fx : how.fx - (m.x - tm.w / 2);
          var reachY = how.ay > 0 ? m.y + tm.h / 2 - how.fy : how.fy - (m.y - tm.h / 2);
          minW = Math.max(minW, reachX + T);
          minH = Math.max(minH, reachY + T);
        });
      }
    }
    if (maxW >= minW) { n.w = Math.min(Math.max(n.w, minW), maxW); } else { n.w = maxW; }
    if (maxH >= minH) { n.h = Math.min(Math.max(n.h, minH), maxH); } else { n.h = maxH; }
  }

  // ======================================================== the toolbox ==
  // A design's Add: a box to search every icon, the ones used last, every
  // set of them as a tile -- its face, its name, how many -- and the few
  // plain shapes a design still wants: words, a note, a box.
  var drawAddersCharting = drawAdders;
  drawAdders = function () {
    if (!designMode()) { return drawAddersCharting.apply(this, arguments); }
    var box = el("#adders");
    if (!box) { return; }
    box.innerHTML = "";
    function pick(kind) { addNode(kind); drawAdders(); }
    var find = document.createElement("button");
    find.type = "button";
    find.className = "dz-find";
    find.setAttribute("aria-haspopup", "dialog");
    find.setAttribute("aria-expanded", "false");
    find.innerHTML = iconUi("find") + '<span class="dz-find-says"></span><kbd>/</kbd>';
    find.querySelector(".dz-find-says").textContent = say("ic_find_n", { n: iconTotal() });
    find.onclick = function (ev) {
      ev.stopPropagation();
      if (find.getAttribute("aria-expanded") === "true") { closeMenu(); return; }
      iconLibAt.find = "";
      openIconLibrary(find, pick, "");
    };
    box.appendChild(find);
    var recent = iconRecent().slice(0, 6);
    if (recent.length) {
      var row = document.createElement("div");
      row.className = "dz-recent";
      row.setAttribute("role", "group");
      row.setAttribute("aria-label", TXT.ic_recent);
      row.innerHTML = '<span class="dz-small"></span><div class="dz-recent-row"></div>';
      row.firstChild.textContent = TXT.ic_recent;
      recent.forEach(function (kind) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "icon-quick";
        b.title = kindName(kind);
        b.setAttribute("aria-label", kindName(kind));
        b.innerHTML = iconCard(kind, 22, 30);
        b.onclick = function () { iconUsed(kind); pick(kind); };
        lendAdder(b, kind);
        row.lastChild.appendChild(b);
      });
      box.appendChild(row);
    }
    var head = document.createElement("div");
    head.className = "dz-small dz-sets-head";
    head.textContent = TXT.dz_by_set;
    box.appendChild(head);
    var sets = document.createElement("div");
    sets.className = "dz-sets";
    ICON_SETS.forEach(function (set) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "dz-set";
      b.setAttribute("aria-haspopup", "dialog");
      b.title = TXT[set[0]] || set[0];
      b.innerHTML = '<span class="dz-set-face">' + iconGlyph(ICON_SET_FACE[set[0]] || set[1][0], 22) + "</span>" +
                    '<span class="dz-set-name"></span><span class="dz-set-n"></span>';
      b.querySelector(".dz-set-name").textContent = TXT[set[0]] || set[0];
      b.querySelector(".dz-set-n").textContent = set[1].length;
      b.onclick = function (ev) {
        ev.stopPropagation();
        iconLibAt.find = "";
        openIconLibrary(b, pick, set[0]);
      };
      sets.appendChild(b);
    });
    box.appendChild(sets);
    var plain = document.createElement("div");
    plain.className = "dz-plain";
    [["text", "dz_words"], ["note", "dz_note"]].forEach(function (one) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn small";
      b.innerHTML = keyMark(one[0]) + "<span></span>";
      b.lastChild.textContent = TXT[one[1]];
      b.onclick = function () { addNode(one[0]); };
      lendAdder(b, one[0]);
      plain.appendChild(b);
    });
    var more = document.createElement("button");
    more.type = "button";
    more.className = "btn small set-btn";
    more.setAttribute("aria-haspopup", "menu");
    more.setAttribute("aria-expanded", "false");
    more.innerHTML = '<span class="set-name"></span><svg viewBox="0 0 10 10" aria-hidden="true"><path d="M2.2 3.8 5 6.6l2.8-2.8"/></svg>';
    more.firstChild.textContent = TXT.dz_shapes;
    more.onclick = function (ev) {
      ev.stopPropagation();
      if (more.getAttribute("aria-expanded") === "true") { closeMenu(); return; }
      var r = more.getBoundingClientRect(), kinds = [];
      shapeSets().forEach(function (s) {
        if (s.name === "sg_basic" || s.name === "sg_other") {
          s.kinds.forEach(function (k) { if (k !== "actor" && k !== "text" && k !== "note") { kinds.push(k); } });
        }
      });
      openMenu(r.left, r.bottom + 4, shapeRows(kinds, addNode, true), "shape-set");
      more.setAttribute("aria-expanded", "true");
    };
    plain.appendChild(more);
    box.appendChild(plain);
    paperTakesDrops();
  };
  // "/" from anywhere on the paper: the icons, to search them
  document.addEventListener("keydown", function (ev) {
    if (ev.key !== "/" || !designMode() || ev.ctrlKey || ev.metaKey || ev.altKey) { return; }
    if (typingNow() || el(".menu") || el(".make-sheet") || el("#view3d")) { return; }
    var find = el("#adders .dz-find");
    if (!find || find.offsetParent === null) { return; }
    ev.preventDefault();
    find.click();
  });

  // ==================================================== the design panel ==
  // A thing picked in a design: what it is; its name; its size in feet or
  // metres -- width, depth and height, or for a room its ceiling, for
  // something on a wall how high up it hangs -- each limited as above, the
  // limit said when it is reached; which way round it is; its colors; and
  // another like it, or away with it.  No arrows, no steps, no words fitted.
  var DZ_TURN = {
    left: '<path d="M7 4.5H4.5V7M4.8 7A6 6 0 1 1 6 14.6"/>',
    right: '<path d="M13 4.5h2.5V7M15.2 7A6 6 0 1 0 14 14.6"/>',
    drop: '<path d="M4 6h12M8 6V4h4v2M5.8 6l.9 10h6.6l.9-10"/>',
    another: '<rect x="3.5" y="3.5" width="13" height="13" rx="2"/><path d="M10 7v6M7 10h6"/>'
  };
  function dzArt(name) {
    return '<svg class="iu" viewBox="0 0 20 20" aria-hidden="true">' + DZ_TURN[name] + "</svg>";
  }

  // The sizes a thing has, in metres: what each is called, and how it is
  // read from it and put back.
  function sizesOf(n) {
    var P = FLOOR_PX, out = [];
    function own() { n.own = true; }
    var w = { key: "w", name: TXT.width, get: function () { return n.w / P; }, set: function (m) { n.w = Math.round(m * P * 10) / 10; own(); } };
    var h = { key: "h", name: TXT.fp_depth, get: function () { return n.h / P; }, set: function (m) { n.h = Math.round(m * P * 10) / 10; own(); } };
    var tall = { key: "tall", name: TXT.dz_height, get: function () { return pieceHigh(n); }, set: function (m) { n.tall = Math.round(m * 1000) / 1000; } };
    if (n.kind === "i_room" || n.kind === "i_floor") {
      out.push(w, h, { key: "ceil", name: TXT.fp_ceiling, get: function () { return ceilOf(n); },
                       set: function (m) { n.ceil = Math.round(m * 1000) / 1000; } });
    } else if (isArea(n.kind)) {
      out.push(w, h);
    } else if (isFigure(n.kind)) {
      out.push(tall);
    } else if (WALK_DOORS[n.kind] || n.kind === "i_window") {
      out.push(w);
    } else if (V3_WALL[n.kind]) {
      out.push(w, tall, { key: "lift", name: TXT.dz_lift, get: function () { return wallHang(n)[0]; },
                          set: function (m) { n.lift = Math.round(m * 1000) / 1000; } });
    } else if (FROM_CEILING[n.kind]) {
      out.push(w, h, tall, { key: "drop", name: TXT.dz_drop, get: function () { return hangDrop(n)[0]; },
                             set: function (m) { n.drop = Math.round(m * 1000) / 1000; } });
    } else if (BETWEEN_FLOORS[n.kind] || n.kind === "i_wall" || n.kind === "i_fence" || LIES_FLAT[n.kind]) {
      out.push(w, h);
    } else {
      out.push(w, h, tall);
    }
    return out;
  }

  // One size, as a box to type it in: shown as a builder says it, taken
  // as any way it is written, stepped by the arrow keys (an inch, or a
  // centimetre; a foot or ten with Shift), and kept to its limits.
  function sizeField(n, one, after) {
    var cell = document.createElement("label");
    cell.className = "dz-dim";
    cell.innerHTML = '<span class="dz-dim-name"></span>';
    cell.firstChild.textContent = one.name;
    var input = document.createElement("input");
    input.type = "text";
    input.className = "field dz-len";
    input.setAttribute("inputmode", "decimal");
    input.setAttribute("spellcheck", "false");
    input.setAttribute("autocomplete", "off");
    input.value = lenSay(one.get());
    cell.appendChild(input);
    var undoKept = false;
    function put(m) {
      var L = limitsOf(n), range = L[one.key] || [0.02, 400];
      var want = m, got = Math.min(Math.max(m, range[0]), range[1]);
      if (!undoKept) { keepUndo(); undoKept = true; }
      one.set(got);
      if (one.key === "w" || one.key === "h") {
        keepIn(n);
        if (n.kind === "i_room") { heldBy(n).forEach(keepIn); }
      }
      drawHand();
      input.value = lenSay(one.get());
      after(Math.abs(got - want) > 0.004 ? (L.why[one.key] || "") : "", input);
    }
    function apply() {
      var m = lenRead(input.value);
      if (isNaN(m) || m <= 0) {
        input.classList.add("bad");
        after(TXT.dz_bad_len, input);
        return;
      }
      input.classList.remove("bad");
      put(m);
    }
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); apply(); input.select(); }
      else if (ev.key === "ArrowUp" || ev.key === "ArrowDown") {
        ev.preventDefault();
        var m = lenRead(input.value);
        if (isNaN(m)) { m = one.get(); }
        put(Math.max(0.01, m + (ev.key === "ArrowUp" ? 1 : -1) * lenStep(ev.shiftKey)));
        input.select();
      } else if (ev.key === "Escape") {
        input.value = lenSay(one.get());
        input.blur();
      }
      ev.stopPropagation();              // the paper's keys are not the box's
    });
    input.addEventListener("change", apply);
    input.addEventListener("focus", function () { undoKept = false; setTimeout(function () { input.select(); }, 0); });
    return cell;
  }

  function sizeSection(box, n) {
    var parts = sizesOf(n);
    if (!parts.length) { return; }
    var head = document.createElement("div");
    head.className = "dz-head-row";
    head.innerHTML = '<span class="dz-small"></span>';
    head.firstChild.textContent = TXT.dz_size;
    var back = document.createElement("button");
    back.type = "button";
    back.className = "dz-link";
    back.textContent = TXT.dz_standard;
    back.title = TXT.dz_standard_tip;
    back.onclick = function () {
      keepUndo();
      delete n.tall; delete n.lift; delete n.drop;
      if (!isArea(n.kind)) { n.own = false; measure(n, true); keepIn(n); }
      drawHand(); drawHandPanel();
    };
    head.appendChild(back);
    box.appendChild(head);
    var row = document.createElement("div");
    row.className = "dz-dims dz-dims-" + parts.length;
    var note = document.createElement("p");
    note.className = "dz-note";
    note.hidden = true;
    function said(what, input) {
      note.textContent = what || "";
      note.hidden = !what;
      if (what) {
        note.classList.remove("flash");
        void note.offsetWidth;
        note.classList.add("flash");
      }
      all(".dz-len", row).forEach(function (other) {
        if (other !== input && document.activeElement !== other) {
          var one = parts[all(".dz-len", row).indexOf(other)];
          if (one) { other.value = lenSay(one.get()); }
        }
      });
    }
    parts.forEach(function (one) { row.appendChild(sizeField(n, one, said)); });
    box.appendChild(row);
    box.appendChild(note);
    // what a lot comes to, under its own sizes (lotMeasure, 03-icons.js)
    if (n.kind === "i_lot") { lotSection(box, n); }
  }

  function lotSection(box, n) {
    var head = document.createElement("div");
    head.className = "dz-small dz-sub-head";
    head.textContent = TXT.lot_keep;
    box.appendChild(head);
    var row = document.createElement("div");
    row.className = "dz-dims dz-dims-3";
    var sb = lotSetbacks(n), sums = document.createElement("div");
    sums.className = "lot-sums";
    function tell() {
      var m = lotMeasure(n), unit = TXT.fp_unit || "m";
      sums.innerHTML = "";
      [say("lot_says", { w: lengthSays(n.w), d: lengthSays(n.h), unit: unit, area: areaSays(m.area) }),
       say("lot_build", { w: lengthSays(m.env.w), d: lengthSays(m.env.h), unit: unit, area: areaSays(m.build) }),
       say("lot_house", { area: areaSays(m.house) }) + " · " + say("lot_yard", { area: areaSays(m.yard) })]
        .forEach(function (one) {
          var line = document.createElement("div");
          line.textContent = one;
          sums.appendChild(line);
        });
    }
    [["front", TXT.lot_front], ["side", TXT.lot_side], ["back", TXT.lot_back]].forEach(function (k) {
      row.appendChild(sizeField(n, {
        key: "setback", name: k[1],
        get: function () { return lotSetbacks(n)[k[0]]; },
        set: function (m) { n.lot = n.lot || {}; n.lot[k[0]] = Math.round(m * 100) / 100; }
      }, function () { tell(); }));
    });
    box.appendChild(row);
    box.appendChild(sums);
    tell();
  }

  function designPanel(box, n) {
    box.innerHTML = "";
    var top = document.createElement("div");
    top.className = "dz-top";
    top.innerHTML = (ICONS[n.kind] ? iconCard(n.kind, 26, 38) : '<span class="dz-plain-mark">' + keyMark(n.kind) + "</span>") +
                    '<div class="dz-what"><strong></strong><small></small></div>';
    top.querySelector("strong").textContent = ICONS[n.kind] ? labelName(n.kind) : kindName(n.kind);
    top.querySelector("small").textContent = ICONS[n.kind] ? TXT[ICON_SET_OF[n.kind]] || "" : "";
    box.appendChild(top);

    // its name: what it is called on the plan, in 3D and in a walk
    var named = document.createElement("label");
    named.className = "dz-field";
    named.innerHTML = '<span class="dz-small"></span>';
    named.firstChild.textContent = ICONS[n.kind] ? TXT.dz_name : TXT.words_in;
    var words = document.createElement("textarea");
    words.className = "field dz-words";
    words.rows = 1;
    words.value = n.text || "";
    words.placeholder = n.kind === "i_room" ? roomCalled(n) : ICONS[n.kind] ? labelName(n.kind) : "";
    function fit() { words.style.height = "auto"; words.style.height = Math.min(120, words.scrollHeight + 2) + "px"; }
    var typedOnce = false;
    words.oninput = function () {
      if (!typedOnce) { typedOnce = true; keepUndo(); }
      n.text = words.value;
      fit();
      drawHand();
    };
    words.addEventListener("keydown", function (ev) { ev.stopPropagation(); });
    named.appendChild(words);
    box.appendChild(named);
    setTimeout(fit, 0);

    if (ICONS[n.kind]) { sizeSection(box, n); }

    // which way round
    var turnRow = document.createElement("div");
    turnRow.className = "dz-turn";
    turnRow.innerHTML = '<span class="dz-small"></span>';
    turnRow.firstChild.textContent = TXT.turn;
    function turnBy(by) {
      keepUndo();
      var t = (((n.turn || 0) + by) % 360 + 360) % 360;
      if (t) { n.turn = t; } else { delete n.turn; }
      keepIn(n);
      if (SNAP_IN_WALL[n.kind]) { snapToWalls([n.id]); }
      drawHand(); drawHandPanel();
    }
    var left = document.createElement("button");
    left.type = "button";
    left.className = "btn small icon-btn";
    left.title = TXT.dz_turn_left;
    left.setAttribute("aria-label", TXT.dz_turn_left);
    left.innerHTML = dzArt("left");
    left.onclick = function () { turnBy(-90); };
    var deg = document.createElement("input");
    deg.type = "number";
    deg.className = "field dz-deg";
    deg.step = 15; deg.min = 0; deg.max = 359;
    deg.value = Math.round(n.turn || 0);
    deg.setAttribute("aria-label", TXT.turn);
    var degKept = false;
    deg.oninput = function () {
      var want = parseFloat(deg.value);
      if (isNaN(want)) { return; }
      if (!degKept) { degKept = true; keepUndo(); }
      var t = ((want % 360) + 360) % 360;
      if (t) { n.turn = t; } else { delete n.turn; }
      drawHand();
    };
    deg.addEventListener("keydown", function (ev) { ev.stopPropagation(); });
    var right = document.createElement("button");
    right.type = "button";
    right.className = "btn small icon-btn";
    right.title = TXT.dz_turn_right;
    right.setAttribute("aria-label", TXT.dz_turn_right);
    right.innerHTML = dzArt("right");
    right.onclick = function () { turnBy(90); };
    var spin = document.createElement("div");
    spin.className = "dz-spin";
    spin.appendChild(left); spin.appendChild(deg);
    spin.insertAdjacentHTML("beforeend", '<span class="dz-deg-sign">°</span>');
    spin.appendChild(right);
    turnRow.appendChild(spin);
    box.appendChild(turnRow);

    // its colors, as everywhere (02-paint.js)
    var paints = document.createElement("div");
    paints.className = "trio";
    var mine = style.nodes["h" + n.id] = style.nodes["h" + n.id] || {};
    var k = kindColors(n.kind);
    [[TXT.fill, "fill", k.fill || "#ffffff"],
     [TXT.outline, "line", k.line || style.ink || "#000000"],
     [TXT.text, "text", k.text || style.words || style.ink || "#000000"]].forEach(function (item) {
      var cell = document.createElement("label");
      cell.innerHTML = "<span>" + item[0] + "</span>";
      var firstTouch = true;
      cell.appendChild(swatch(mine[item[1]], item[2], function (v) {
        if (firstTouch) { firstTouch = false; keepUndo(); }
        mine[item[1]] = v;
        paint();
      }));
      paints.appendChild(cell);
    });
    var colors = document.createElement("div");
    colors.className = "dz-small dz-sub-head";
    colors.textContent = TXT.colors_here;
    box.appendChild(colors);
    box.appendChild(paints);

    // another, or away with it
    var acts = document.createElement("div");
    acts.className = "dz-acts";
    var again = document.createElement("button");
    again.type = "button";
    again.className = "btn small";
    again.innerHTML = dzArt("another") + "<span></span>";
    again.lastChild.textContent = TXT.m_copy;
    again.onclick = function () { duplicateShapes([n.id]); };
    var away = document.createElement("button");
    away.type = "button";
    away.className = "btn small dz-drop";
    away.innerHTML = dzArt("drop") + "<span></span>";
    away.lastChild.textContent = TXT.delete;
    away.onclick = function () {
      keepUndo();
      dropShapes([n.id]);
      drawHand(); drawHandPanel(); showReport();
    };
    acts.appendChild(again);
    acts.appendChild(away);
    // joined up, where arrows mean something here: wires, cables, hand-offs
    if (linksWanted()) {
      var join = document.createElement("button");
      join.type = "button";
      join.className = "btn small dz-join" + (joining ? " primary" : "");
      join.textContent = joining ? TXT.connect_now : TXT.connect;
      join.onclick = function () { joining = !joining; joinFrom = null; drawHand(); drawHandPanel(); };
      acts.insertBefore(join, acts.firstChild);
    }
    box.appendChild(acts);
  }

  // What is picked comes first in the card, over Add, where it is seen
  // without going down past every set of icons to it -- and is brought
  // into view when it is a new pick.
  var panelFor = null;
  function selFirst(on) {
    var card = el("#hand"), box = el("#hand-sel"), head = card && card.querySelector("h2"), adders = el("#adders");
    if (!card || !box || !head || !adders) { return; }
    if (on && box.nextSibling !== head) { card.insertBefore(box, head); }
    if (!on && box.previousSibling !== adders && box.parentNode === card) { card.insertBefore(box, adders.nextSibling); }
    card.classList.toggle("dz-picked", !!on);
  }
  var drawHandPanelCharting = drawHandPanel;
  drawHandPanel = function () {
    var n = nodeById(picked), box = el("#hand-sel");
    if (!designMode() || !n || !box || linkById(chosen) || many.length > 1) {
      selFirst(false);
      panelFor = null;
      return drawHandPanelCharting.apply(this, arguments);
    }
    drawSelection();                     // the Style side is about it as well
    drawSelBar();                        // and the bar over the paper
    designPanel(box, n);
    selFirst(true);
    if (panelFor !== n.id) {
      panelFor = n.id;
      try { box.scrollIntoView({ block: "nearest", behavior: typeof STILL !== "undefined" && STILL ? "auto" : "smooth" }); }
      catch (e) { /* an older browser: it stays where it is */ }
    }
  };

  // ============================================== sizes on the paper ==
  // The thing picked in a design wears its sizes: a measuring line along
  // its top and down its side, each with its length in the middle -- and a
  // length pressed is a box to type another in, there and then.
  var dimEditing = null;
  function dimsArt() {
    var g = chart && chart.querySelector("g.dz-dims-on");
    if (g) { g.remove(); }
    if (!designMode() || !chart || many.length > 1) { return; }
    var n = nodeById(picked);
    if (!n || !ICONS[n.kind] || isFigure(n.kind) || quarter(n) === null) { return; }
    var parts = sizesOf(n).filter(function (one) { return one.key === "w" || one.key === "h"; });
    if (!parts.length) { return; }
    var t = turned(n), ox = handOrigin.x, oy = handOrigin.y;
    var l = n.x - t.w / 2 + ox, r = n.x + t.w / 2 + ox, tp = n.y - t.h / 2 + oy, b = n.y + t.h / 2 + oy;
    var q = quarter(n), GAP = 16, TICK = 5;
    var NS = "http://www.w3.org/2000/svg";
    g = document.createElementNS(NS, "g");
    g.setAttribute("class", "dz-dims-on");
    function line(x1, y1, x2, y2) {
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", "M" + x1 + " " + y1 + "L" + x2 + " " + y2);
      p.setAttribute("class", "dz-dim-line");
      g.appendChild(p);
    }
    function pill(x, y, one) {
      var said = lenSay(one.get());
      var w = Math.max(30, said.length * 6.6 + 14);
      var p = document.createElementNS(NS, "g");
      p.setAttribute("class", "dz-dim-pill");
      p.setAttribute("role", "button");
      p.setAttribute("tabindex", "0");
      p.setAttribute("aria-label", one.name + ": " + said);
      p.innerHTML = '<title></title><rect x="' + (x - w / 2) + '" y="' + (y - 9) + '" width="' + w +
                    '" height="18" rx="9"/><text x="' + x + '" y="' + (y + 4) + '" text-anchor="middle"></text>';
      p.querySelector("title").textContent = TXT.dz_dims_tip;
      p.querySelector("text").textContent = said;
      p.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); ev.preventDefault(); });
      p.addEventListener("click", function (ev) { ev.stopPropagation(); dimEdit(n, one, p); });
      p.addEventListener("keydown", function (ev) {
        if (ev.key === "Enter" || ev.key === " ") { ev.preventDefault(); ev.stopPropagation(); dimEdit(n, one, p); }
      });
      g.appendChild(p);
    }
    // the width runs along its top as the paper has it, the depth down its side
    var across = q ? parts.filter(function (o) { return o.key === "h"; })[0] : parts.filter(function (o) { return o.key === "w"; })[0];
    var down = q ? parts.filter(function (o) { return o.key === "w"; })[0] : parts.filter(function (o) { return o.key === "h"; })[0];
    if (across) {
      var y = tp - GAP;
      line(l, y, r, y); line(l, y - TICK, l, y + TICK); line(r, y - TICK, r, y + TICK);
      pill((l + r) / 2, y, across);
    }
    if (down) {
      var x = r + GAP;
      line(x, tp, x, b); line(x - TICK, tp, x + TICK, tp); line(x - TICK, b, x + TICK, b);
      pill(x, (tp + b) / 2, down);
    }
    chart.appendChild(g);
  }

  function dimEdit(n, one, pillEl) {
    if (dimEditing) { return; }
    var r = pillEl.getBoundingClientRect();
    var input = document.createElement("input");
    input.type = "text";
    input.className = "dz-dim-edit";
    input.setAttribute("inputmode", "decimal");
    input.setAttribute("aria-label", one.name);
    input.value = lenSay(one.get());
    input.style.left = Math.round(r.left + r.width / 2 - 55) + "px";
    input.style.top = Math.round(r.top + r.height / 2 - 15) + "px";
    document.body.appendChild(input);
    dimEditing = input;
    input.focus();
    input.select();
    var done = false;
    function finish(keep) {
      if (done) { return; }
      done = true;
      var m = lenRead(input.value);
      dimEditing = null;
      input.remove();
      if (!keep || isNaN(m) || m <= 0) { return; }
      var L = limitsOf(n), range = L[one.key] || [0.02, 400];
      var got = Math.min(Math.max(m, range[0]), range[1]);
      setTimeout(function () {           // not from inside the box's own going
        keepUndo();
        one.set(got);
        keepIn(n);
        if (n.kind === "i_room") { heldBy(n).forEach(keepIn); }
        drawHand(); drawHandPanel();
        if (Math.abs(got - m) > 0.004 && L.why[one.key]) { handSays(L.why[one.key], true); }
      }, 0);
    }
    input.addEventListener("keydown", function (ev) {
      if (ev.key === "Enter") { ev.preventDefault(); finish(true); }
      else if (ev.key === "Escape") { ev.preventDefault(); finish(false); }
      ev.stopPropagation();
    });
    input.addEventListener("blur", function () { finish(true); });
  }

  var drawHandSized = drawHand;
  drawHand = function () {
    var out = drawHandSized.apply(this, arguments);
    dimsArt();
    dressMaking();
    return out;
  };

  // ========================================================== Tidy up ==
  // (asked for, 2026-10-02: "the tidy up button should actually work")  A
  // floor plan is tidied the way somebody would straighten one: anything a
  // few degrees off square put square; rooms whose walls nearly meet moved
  // to share them (carrying what is in them); furniture brought in off its
  // walls, out of what it stands in, and set back against a wall it was
  // nearly against; doors, windows and pictures fitted into their walls.
  // It glides there, and Undo takes it all back in one.
  function designTidy() {
    var P = FLOOR_PX, before = tidyLook(), was = JSON.stringify(hand.nodes.map(function (n) {
      return [n.id, n.x, n.y, n.turn || 0];
    }));
    keepUndo();
    // square, near enough
    hand.nodes.forEach(function (n) {
      var t = (((n.turn || 0) % 360) + 360) % 360, near = Math.round(t / 90) * 90;
      if (t && Math.abs(t - near) <= 10) { if (near % 360) { n.turn = near % 360; } else { delete n.turn; } }
    });
    // rooms sharing walls they nearly share
    var rooms = hand.nodes.filter(function (n) { return n.kind === "i_room" && quarter(n) !== null; });
    rooms.sort(function (a, b) { return b.w * b.h - a.w * a.h; });
    var settled = {};
    rooms.forEach(function (a) {
      settled[a.id] = true;
      rooms.forEach(function (b) {
        if (settled[b.id] || b === a) { return; }
        var ta = turned(a), tb = turned(b), dx = 0, dy = 0, SNAP = 14;
        var al = a.x - ta.w / 2, ar = a.x + ta.w / 2, at = a.y - ta.h / 2, ab = a.y + ta.h / 2;
        var bl = b.x - tb.w / 2, br = b.x + tb.w / 2, bt = b.y - tb.h / 2, bb = b.y + tb.h / 2;
        var acrossY = Math.min(ab, bb) - Math.max(at, bt) > 10, acrossX = Math.min(ar, br) - Math.max(al, bl) > 10;
        if (acrossY) {
          if (Math.abs(bl - ar) <= SNAP && Math.abs(bl - ar) > 0.4) { dx = ar - bl; }
          else if (Math.abs(br - al) <= SNAP && Math.abs(br - al) > 0.4) { dx = al - br; }
        }
        if (acrossX) {
          if (Math.abs(bt - ab) <= SNAP && Math.abs(bt - ab) > 0.4) { dy = ab - bt; }
          else if (Math.abs(bb - at) <= SNAP && Math.abs(bb - at) > 0.4) { dy = at - bb; }
        }
        // and lined up with it, where its edges nearly are
        if (dx && !dy) {
          if (Math.abs(bt - at) <= SNAP && Math.abs(bt - at) > 0.4) { dy = at - bt; }
          else if (Math.abs(bb - ab) <= SNAP && Math.abs(bb - ab) > 0.4) { dy = ab - bb; }
        } else if (dy && !dx) {
          if (Math.abs(bl - al) <= SNAP && Math.abs(bl - al) > 0.4) { dx = al - bl; }
          else if (Math.abs(br - ar) <= SNAP && Math.abs(br - ar) > 0.4) { dx = ar - br; }
        }
        if (!dx && !dy) { return; }
        var carried = heldIn(b).map(nodeById).filter(Boolean);
        b.x += dx; b.y += dy;
        carried.forEach(function (m) { m.x += dx; m.y += dy; });
      });
    });
    // furniture: in off the walls, against one it is nearly against, out of
    // each other
    var plan = walkPlan(), pieces = hand.nodes.filter(function (n) { return keepsToRoom(n) && quarter(n) !== null; });
    function where() { return JSON.stringify(pieces.map(function (n) { return [n.x, n.y]; })); }
    // over again until nothing more moves: a piece moved out of another may
    // then be near enough a wall to go against it
    for (var round = 0; round < 4; round++) {
    var stood = where();
    pieces.forEach(function (n) {
      keepIn(n);
      var room = roomAround(n);
      if (!room || quarter(room) !== 0 || ON_TOP[n.kind] || LIES_FLAT[n.kind] || FROM_CEILING[n.kind]) { return; }
      var f = innerOf(room), t = turned(n), NEAR = 16;
      var gaps = [["l", n.x - t.w / 2 - f.l], ["r", f.r - (n.x + t.w / 2)], ["t", n.y - t.h / 2 - f.t], ["b", f.b - (n.y + t.h / 2)]];
      gaps.forEach(function (g) {
        if (g[1] <= 0.4 || g[1] > NEAR) { return; }
        var x = n.x + (g[0] === "l" ? -g[1] : g[0] === "r" ? g[1] : 0);
        var y = n.y + (g[0] === "t" ? -g[1] : g[0] === "b" ? g[1] : 0);
        if (!hand.nodes.some(function (m) { return m !== n && boxesMeet(n, x, y, m, m.x, m.y, -0.5); })) {
          n.x = x; n.y = y;
        }
      });
    });
    apartAdvice(plan, function (text, id, fix) { if (fix && fix.go) { fix.go(); } });
    if (where() === stood) { break; }
    }
    // what goes in a wall, in its wall
    snapToWalls(hand.nodes.filter(function (n) { return SNAP_IN_WALL[n.kind]; }).map(function (n) { return n.id; }));
    var now = JSON.stringify(hand.nodes.map(function (n) { return [n.id, n.x, n.y, n.turn || 0]; }));
    if (now === was) {
      wasLike.pop(); showUndo();
      handSays(TXT.h_tidy_done);
      return;
    }
    var moved = 0, old = JSON.parse(was), at = {};
    old.forEach(function (o) { at[o[0]] = o; });
    hand.nodes.forEach(function (n) {
      var o = at[n.id];
      if (o && (o[1] !== n.x || o[2] !== n.y || o[3] !== (n.turn || 0))) { moved++; }
    });
    glideHeld++;
    try { drawHand(); } finally { glideHeld--; }
    drawHandPanel();
    tidyMotion(before, hand.nodes.map(function (n) { return n.id; }), "fore");
    showReport();
    handSays(say("dz_tidied", { n: moved }));
  }

  if (el("#hand-tidy")) {
    var tidyBoarded = el("#hand-tidy").onclick;
    el("#hand-tidy").onclick = function (ev) {
      var scene = byHand && boardNow();
      if (scene && scene.name === "home") { designTidy(); return; }
      return tidyBoarded ? tidyBoarded.call(this, ev) : undefined;
    };
  }
