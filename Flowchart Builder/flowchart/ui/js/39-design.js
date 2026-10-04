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
  // or a rocket's flight -- and in a floor plan, which room opens into
  // which (39-join.js): there only rooms, doors, windows and stairs offer
  // to draw them, not the furniture.
  function linksWanted(n) {
    if (!designMode() || boardName() !== "home") { return true; }
    return !n || typeof tieable !== "function" || tieable(n);
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
    // gone to the Text or Code tab: the question was the paper's, and it
    // stayed up over them (found 2026-10-01)
    if (!byHand && el(".make-sheet")) { el(".make-sheet").remove(); }
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

  // ============================================================ where it goes ==
  // (asked for, 2026-10-01: "when tapping to add things into the design to
  // place them in the spot where you think it would go rather than outside
  // and fit it to the area best so there is enough room for people to walk
  // too")  A piece added from the panel used to go under whatever was
  // picked, or below everything -- outside the house.  Now it goes where it
  // would go in a home:
  //
  //   the room       the one picked (or the one round what is picked), else
  //                  the room it belongs in -- a bed to a bedroom, a stove to
  //                  the kitchen -- by what each room is (roomKind)
  //   with what      a nightstand at the head of the bed, a coffee table in
  //   it goes with   front of the sofa, a lamp on the nightstand, a hood over
  //                  the stove, a picture over the sofa, a TV facing it
  //   or where it    back to a wall (a bed, a dresser, a counter, joined to
  //   stands         the run already there), in a corner (a plant, a lamp),
  //                  or in the middle (a rug, a dining table)
  //
  // and never in a doorway, in front of a window if it is tall, or with no
  // room in front of it to walk: a strip before it -- 90 cm before a counter,
  // 75 before a bed -- is kept clear of anything solid.  Where nothing fits,
  // what can be shorter (a sofa, a counter, a desk) is tried shorter, and
  // last of all it goes in the room's most open spot.  Out of doors: the
  // yard, round the house on its lot.  Dropped somewhere, it stays there.
  var PLACE_ROOM = {
    bed: "i_bed i_bedking i_bed1 i_bunkbed i_crib i_nightstand i_wardrobe i_dresser i_vanitytable i_chest i_bench",
    kitchen: "i_counter i_island i_stove i_fridge i_kitchensink i_dishwasher i_pantry i_microwave i_coffeemaker i_toaster i_kettle i_fruitbowl i_trash i_hood i_herbs i_stool",
    dining: "i_dining i_roundtable i_chair",
    bath: "i_toilet i_sink i_vanity i_bathtub i_shower i_bathmat i_towelrail i_medicine i_hamper",
    laundry: "i_washer i_dryer i_ironing i_dryrack i_utilitysink i_heater",
    living: "i_sofa i_loveseat i_sectional i_armchair i_recliner i_ottoman i_beanbag i_coffee i_sidetable i_tvstand i_tv i_walltv " +
            "i_fireplace i_piano i_bookcase i_aquarium i_speaker i_rug i_lamp i_arclamp i_soundbar i_console i_recordplayer i_projector i_proscreen",
    office: "i_desk i_officechair i_filing i_pc i_monitor i_desklamp",
    garage: "i_parked",
    closet: "i_closetrod i_closetshelves i_reachin i_shoerack i_coatrack",
    // the second lot of icons
    lounge: "i_consoletable i_chaise i_rocker",
    dine: "i_sideboard i_hutch i_barcart i_highchair",
    sleep: "i_daybed i_floormirror i_toybox",
    study: "i_standdesk i_lshapedesk i_whiteboard",
    cook: "i_oven i_winecooler",
    wash: "i_cornertub i_linencab",
    shop: "i_workbench i_shelving i_toolchest i_evcharger i_freezer i_furnace",
    gym: "i_treadmill i_exbike i_weightbench i_yogamat i_pooltable i_pingpong i_dartboard i_easel"
  };
  var PLACE_ALSO = { dining: ["kitchen", "living"], laundry: ["bath", "garage"], office: ["bed", "living"], closet: ["bed"],
                     lounge: ["living"], dine: ["dining", "kitchen", "living"], sleep: ["bed"], study: ["office", "bed", "living"],
                     cook: ["kitchen"], wash: ["bath"], shop: ["garage", "laundry"], gym: ["room", "garage", "living"] };
  // what is played or worked on out of doors, though not in the garden's set
  var PLACE_OUTSIDE = { i_trampoline: true, i_swing: true };
  // the rooms each may go in at all, when its own is full
  var PLACE_FITS = {
    bed: ["bed", "multi", "room"], kitchen: ["kitchen", "multi", "dining"], dining: ["dining", "kitchen", "living", "multi", "room"],
    bath: ["bath"], laundry: ["laundry", "bath", "garage", "room"], living: ["living", "dining", "office", "bed", "multi", "room"],
    office: ["office", "bed", "living", "multi", "room"], garage: ["garage"], closet: ["closet", "bed"],
    lounge: ["living", "dining", "office", "bed", "multi", "room"], dine: ["dining", "kitchen", "living", "multi", "room"],
    sleep: ["bed", "office", "living", "multi", "room"], study: ["office", "bed", "living", "multi", "room"],
    cook: ["kitchen", "multi"], wash: ["bath"], shop: ["garage", "laundry", "room"],
    gym: ["room", "garage", "living", "office", "bed", "multi"]
  };
  var PLACE_ROOM_OF = {};
  Object.keys(PLACE_ROOM).forEach(function (r) { PLACE_ROOM[r].split(" ").forEach(function (k) { PLACE_ROOM_OF[k] = r; }); });
  function kindsSet(list) { var o = {}; list.split(" ").forEach(function (k) { o[k] = true; }); return o; }
  // back to a wall; in a corner; out in the room
  var PLACE_WALL = kindsSet("i_bed i_bedking i_bed1 i_bunkbed i_crib i_sofa i_loveseat i_sectional i_dresser i_wardrobe i_bookcase " +
    "i_tvstand i_tv i_desk i_counter i_stove i_fridge i_kitchensink i_dishwasher i_pantry i_toilet i_sink i_vanity i_bathtub " +
    "i_washer i_dryer i_utilitysink i_piano i_fireplace i_aquarium i_filing i_cubeshelf i_shoerack i_closetrod i_closetshelves " +
    "i_reachin i_vanitytable i_armchair i_recliner i_ironing i_dryrack i_consoletable i_sideboard i_hutch i_barcart i_daybed " +
    "i_floormirror i_toybox i_standdesk i_oven i_winecooler i_freezer i_linencab i_workbench i_shelving i_toolchest i_chaise " +
    "i_treadmill i_exbike");
  var PLACE_CORNER = kindsSet("i_plant i_palm i_lamp i_arclamp i_fan i_coatrack i_cattree i_trash i_hamper i_cornershelf i_cactus " +
    "i_flowers i_speaker i_heater i_shower i_dogbed i_sidetable i_beanbag i_rocker i_cornertub i_lshapedesk i_easel i_furnace");
  var PLACE_MIDDLE = kindsSet("i_rug i_dining i_roundtable i_island i_patio i_hottub i_pool i_ottoman i_chair i_stool i_officechair " +
    "i_pooltable i_pingpong i_weightbench i_highchair i_yogamat");
  // what it is put on, beside, or before -- in that order of liking
  var PLACE_ON = {
    i_microwave: "i_counter i_island", i_coffeemaker: "i_counter i_island", i_toaster: "i_counter i_island",
    i_kettle: "i_counter i_island", i_fruitbowl: "i_island i_dining i_roundtable i_counter", i_herbs: "i_counter i_island",
    i_tablelamp: "i_nightstand i_sidetable i_dresser i_desk", i_desklamp: "i_desk", i_monitor: "i_desk",
    i_vase: "i_coffee i_sidetable i_dresser i_tvstand i_dining", i_candle: "i_coffee i_sidetable i_dining i_dresser",
    i_books: "i_coffee i_sidetable i_nightstand i_desk", i_frame: "i_dresser i_nightstand i_desk i_sidetable",
    i_basket: "i_dresser i_coffee i_tvstand", i_succulent: "i_desk i_sidetable i_coffee i_dresser",
    i_soundbar: "i_tvstand", i_console: "i_tvstand", i_recordplayer: "i_tvstand i_dresser"
  };
  // how far in front of it is kept clear to walk, in metres
  var PLACE_FRONT = { i_counter: 1, i_stove: 1, i_fridge: 1, i_kitchensink: 1, i_dishwasher: 1, i_pantry: 0.9, i_island: 0.9,
                      i_bed: 0.7, i_bedking: 0.7, i_bed1: 0.6, i_bunkbed: 0.7, i_crib: 0.6, i_wardrobe: 0.8, i_dresser: 0.8,
                      i_toilet: 0.55, i_sink: 0.6, i_vanity: 0.7, i_bathtub: 0.6, i_washer: 0.9, i_dryer: 0.9,
                      i_sofa: 0.8, i_loveseat: 0.8, i_sectional: 0.8, i_desk: 0.8, i_piano: 0.8, i_reachin: 0.7,
                      i_pooltable: 1.4, i_pingpong: 1.6, i_oven: 1, i_workbench: 0.9, i_treadmill: 1, i_standdesk: 0.8,
                      i_lshapedesk: 0.8, i_hutch: 0.8, i_sideboard: 0.8 };
  // what may be made shorter to fit, and by how much at most
  var PLACE_SHRINK = kindsSet("i_sofa i_sectional i_counter i_island i_desk i_bookcase i_tvstand i_dining i_rug i_vanity i_reachin " +
    "i_closetrod i_closetshelves i_cubeshelf i_shoerack i_dresser i_workbench i_shelving i_sideboard i_consoletable i_standdesk " +
    "i_hutch i_lshapedesk");

  function pRect(x, y, w, h) { return { l: x - w / 2, r: x + w / 2, t: y - h / 2, b: y + h / 2 }; }
  function pMeet(a, b, gap) { gap = gap || 0; return a.l < b.r + gap && b.l < a.r + gap && a.t < b.b + gap && b.t < a.b + gap; }
  function pOf(n) { var q = turned(n); return pRect(n.x, n.y, q.w, q.h); }
  function pInner(room) { var q = turned(room), T = roomWallOf(room); return pRect(room.x, room.y, q.w - 2 * T, q.h - 2 * T); }
  function pInside(r, box) { return r.l >= box.l - 0.5 && r.r <= box.r + 0.5 && r.t >= box.t - 0.5 && r.b <= box.b + 0.5; }
  function pRooms() { return hand.nodes.filter(function (r) { return r.kind === "i_room"; }); }
  function pRoomOf(n) {
    var best = null;
    pRooms().forEach(function (r) { if (r !== n && insideArea(r, n.x, n.y) && (!best || r.w * r.h < best.w * best.h)) { best = r; } });
    return best;
  }
  // what stands in a room, solid, that a new piece must keep clear of
  function pSolids(room, but) {
    return hand.nodes.filter(function (m) {
      return m !== but && typeof isSolid === "function" && isSolid(m.kind) && insideArea(room, m.x, m.y);
    }).map(pOf);
  }
  // the doors into a room, as the floor their leaves swing over and the
  // way through them; its windows, as the wall in front of them
  function pOpenings(room) {
    var doors = [], windows = [], T = roomWallOf(room);
    hand.nodes.forEach(function (m) {
      if (!WALK_DOORS[m.kind] && m.kind !== "i_window") { return; }
      if (!insideArea(room, m.x, m.y, -(Math.max(m.w, m.h) / 2 + T + 4))) { return; }
      var r = pOf(m);
      if (m.kind === "i_window") { windows.push({ l: r.l - 15, r: r.r + 15, t: r.t - 15, b: r.b + 15 }); }
      else { var pad = Math.max(10, 0.45 * FLOOR_PX); doors.push({ l: r.l - pad, r: r.r + pad, t: r.t - pad, b: r.b + pad }); }
    });
    return { doors: doors, windows: windows };
  }
  // The room for it: picked, round what is picked, or the one it belongs in.
  function pRoomFor(kind, before) {
    var rooms = pRooms();
    if (!rooms.length) { return null; }
    if (before && before.kind === "i_room") { return before; }   // a room picked: there
    var want = PLACE_ROOM_OF[kind], plan = typeof walkPlan === "function" ? walkPlan() : null;
    function kindOf(r) { try { return plan ? roomKind(plan, r) : "room"; } catch (e) { return "room"; } }
    function free(r) { var a = r.w * r.h; pSolids(r, null).forEach(function (s) { a -= (s.r - s.l) * (s.b - s.t); }); return a; }
    var order = want ? [want].concat(PLACE_ALSO[want] || []) : ["living"];
    // the room round what is picked -- furnishing it, one thing after
    // another -- unless the new thing is plainly another room's (a stove
    // added with the bed still picked goes to the kitchen)
    var around = before ? pRoomOf(before) : null;
    if (around) {
      var ak = kindOf(around);
      if (!want || ak === "room" || ak === "multi" || order.indexOf(ak) >= 0 ||
          !rooms.some(function (r) { return order.indexOf(kindOf(r)) >= 0; })) { return around; }
    }
    for (var i = 0; i < order.length; i++) {
      var hits = rooms.filter(function (r) { var k = kindOf(r); return k === order[i] || (k === "multi" && order[i] !== "bath"); });
      if (hits.length) { return hits.sort(function (a, b) { return free(b) - free(a); })[0]; }
    }
    // nothing of its kind: the biggest room with nothing in it yet, else the biggest
    var empty = rooms.filter(function (r) { return kindOf(r) === "room"; });
    return (empty.length ? empty : rooms).sort(function (a, b) { return free(b) - free(a); })[0];
  }
  // Every way a piece can stand back to one of a room's walls: turned so
  // its back (its own -y) is to that wall, slid along it.
  function pWallSpots(room, n, w, d) {
    var box = pInner(room), out = [];
    [["top", 0], ["foot", 180], ["left", 270], ["right", 90]].forEach(function (sd) {
      var side = sd[0], turn = sd[1], tw = turn % 180 ? d : w, th = turn % 180 ? w : d;
      var across = side === "top" || side === "foot";
      var a0 = (across ? box.l + tw / 2 : box.t + th / 2), a1 = (across ? box.r - tw / 2 : box.b - th / 2);
      if (a1 < a0 - 0.5) { return; }
      var step = Math.max(3, (a1 - a0) / 40);
      for (var a = a0; a <= a1 + 0.01; a += step) {
        var x = across ? a : side === "left" ? box.l + tw / 2 : box.r - tw / 2;
        var y = across ? (side === "top" ? box.t + th / 2 : box.b - th / 2) : a;
        out.push({ x: x, y: y, turn: turn, w: tw, h: th, side: side, mid: (a0 + a1) / 2, along: a });
      }
    });
    return out;
  }
  // Clear of what stands there, of doorways, of the windows if tall, and
  // with its strip in front clear to walk.
  function pClear(c, room, n, solids, open, relax) {
    var me = pRect(c.x, c.y, c.w, c.h), box = pInner(room);
    if (!pInside(me, box)) { return false; }
    if (LIES_FLAT[n.kind]) { return true; }          // a rug or a mat goes under what stands on it
    if (solids.some(function (s) { return pMeet(me, s, 1); })) { return false; }
    if (open.doors.some(function (s) { return pMeet(me, s, 0); })) { return false; }
    if (pieceHigh(n) > 1.0 && open.windows.some(function (s) { return pMeet(me, s, 0); })) { return false; }
    if (relax) { return true; }
    var front = (PLACE_FRONT[n.kind] || 0.6) * FLOOR_PX, f;
    if (c.side) {
      f = c.side === "top" ? pRect(c.x, me.b + front / 2, c.w * 0.8, front) : c.side === "foot" ? pRect(c.x, me.t - front / 2, c.w * 0.8, front)
        : c.side === "left" ? pRect(me.r + front / 2, c.y, front, c.h * 0.8) : pRect(me.l - front / 2, c.y, front, c.h * 0.8);
      var clipped = { l: Math.max(f.l, box.l), r: Math.min(f.r, box.r), t: Math.max(f.t, box.t), b: Math.min(f.b, box.b) };
      if ((clipped.r - clipped.l) * (clipped.b - clipped.t) < (f.r - f.l) * (f.b - f.t) * 0.7) { return false; }   // no room to stand
      if (solids.some(function (s) { return pMeet(clipped, s, 0); })) { return false; }
    } else {
      // out in the room: a way round it on at least two sides
      var ring = front * 0.8, ways = 0;
      [pRect(c.x, me.t - ring / 2, c.w, ring), pRect(c.x, me.b + ring / 2, c.w, ring),
       pRect(me.l - ring / 2, c.y, ring, c.h), pRect(me.r + ring / 2, c.y, ring, c.h)].forEach(function (s) {
        if (pInside(s, box) && !solids.some(function (o) { return pMeet(s, o, 0); })) { ways++; }
      });
      if (ways < 2) { return false; }
    }
    return true;
  }
  // How good a spot is: higher, better.
  function pScore(c, room, n, solids, open) {
    var s = 0, me = pRect(c.x, c.y, c.w, c.h), box = pInner(room);
    var centre = { i_bed: 1, i_bedking: 1, i_bed1: 0.5, i_sofa: 1, i_loveseat: 1, i_tvstand: 1, i_tv: 1, i_fireplace: 1, i_desk: 0.5, i_piano: 0.4, i_vanity: 0.6 };
    if (c.mid !== undefined) { s -= Math.abs(c.along - c.mid) * (centre[n.kind] || 0.15); }
    // a bed, away from the door; the wall it is against with no door in it
    var doorD = open.doors.reduce(function (m, d) { return Math.min(m, Math.hypot((d.l + d.r) / 2 - c.x, (d.t + d.b) / 2 - c.y)); }, 1e9);
    if (/i_bed|i_crib|i_toilet|i_desk/.test(n.kind) && doorD < 1e9) { s += doorD * 0.4; }
    // a kitchen run, or a laundry pair: up against what is already there
    var runs = { i_counter: 1, i_stove: 1, i_fridge: 1, i_kitchensink: 1, i_dishwasher: 1, i_pantry: 1, i_washer: 1, i_dryer: 1, i_vanity: 1 };
    if (runs[n.kind]) {
      solids.forEach(function (o) {
        var touch = (Math.abs(me.l - o.r) < 3 || Math.abs(me.r - o.l) < 3) && me.t < o.b && o.t < me.b ||
                    (Math.abs(me.t - o.b) < 3 || Math.abs(me.b - o.t) < 3) && me.l < o.r && o.l < me.r;
        if (touch) { s += 80; }
      });
    }
    // a corner piece, into its corner
    if (PLACE_CORNER[n.kind]) { s -= Math.min(me.l - box.l, box.r - me.r) + Math.min(me.t - box.t, box.b - me.b); }
    // out in the room: in its middle, or before what it goes with
    if (PLACE_MIDDLE[n.kind] && !c.side) { s -= Math.hypot(c.x - room.x, c.y - room.y) * 0.5; }
    return s;
  }
  // A piece's place by what it goes with, where that is in the room.
  function pBeside(n, room, solids) {
    var all = hand.nodes.filter(function (m) { return m !== n && insideArea(room, m.x, m.y); });
    function first(kinds) { var ks = kinds.split(" "); for (var i = 0; i < ks.length; i++) { var h = all.filter(function (m) { return m.kind === ks[i]; })[0]; if (h) { return h; } } return null; }
    function at(host, lx, ly, turn) {   // a point in the host's own numbers, turned with it
      var p = v3LocalPt(host, lx, ly);
      return { x: p[0], y: p[1], turn: ((host.turn || 0) + (turn || 0)) % 360 };
    }
    var k = n.kind, host;
    if (k === "i_nightstand" && (host = first("i_bed i_bedking i_bed1"))) {
      return [at(host, -host.w / 2 - n.w / 2 - 2, -host.h / 2 + n.h / 2), at(host, host.w / 2 + n.w / 2 + 2, -host.h / 2 + n.h / 2)];
    }
    if ((k === "i_chest" || k === "i_bench") && (host = first("i_bed i_bedking i_bed1"))) {
      return [at(host, 0, host.h / 2 + n.h / 2 + 3)];
    }
    if ((k === "i_coffee" || k === "i_ottoman") && (host = first("i_sofa i_loveseat i_sectional i_armchair i_recliner"))) {
      return [at(host, 0, host.h / 2 + n.h / 2 + 0.42 * FLOOR_PX)];
    }
    if ((k === "i_officechair" || k === "i_chair") && (host = first("i_desk i_vanitytable"))) {
      return [at(host, 0, host.h / 2 + n.h / 2 - 2, 180)];
    }
    if (k === "i_stool" && (host = first("i_island"))) {
      var made = all.filter(function (m) { return m.kind === "i_stool"; }).length, spots = [];
      for (var i = 0; i < 6; i++) { spots.push(at(host, -host.w / 2 + n.w * (0.8 + ((made + i) % 4) * 1.4), -host.h / 2 - n.h / 2 + 4)); }
      return spots;
    }
    if (k === "i_dishwasher" && (host = first("i_kitchensink"))) {
      return [at(host, host.w / 2 + n.w / 2, -host.h / 2 + n.h / 2), at(host, -host.w / 2 - n.w / 2, -host.h / 2 + n.h / 2)];
    }
    if ((k === "i_tvstand" || k === "i_tv" || k === "i_fireplace") && (host = first("i_sofa i_loveseat i_sectional"))) {
      // the wall the sofa faces, square on to it
      var ft = (host.turn || 0) * Math.PI / 180, fx = -Math.sin(ft), fy = Math.cos(ft), box = pInner(room);
      var reach = Math.abs(fx) > 0.5 ? (fx > 0 ? box.r - host.x : host.x - box.l) : (fy > 0 ? box.b - host.y : host.y - box.t);
      var depth = n.h / 2;
      return [{ x: host.x + fx * (reach - depth), y: host.y + fy * (reach - depth), turn: ((host.turn || 0) + 180) % 360 }];
    }
    if (k === "i_bathmat" && (host = first("i_bathtub i_shower i_vanity"))) {
      return [at(host, 0, host.h / 2 + n.h / 2 + 2)];
    }
    if (k === "i_rug" && (host = first("i_coffee i_dining i_roundtable i_bed i_bedking"))) {
      return [at(host, 0, 0)];
    }
    return [];
  }
  function v3LocalPt(n, lx, ly) {
    var a = (n.turn || 0) * Math.PI / 180, c = Math.cos(a), s = Math.sin(a);
    return [n.x + lx * c - ly * s, n.y + lx * s + ly * c];
  }
  // On top of something: the first of its hosts in the room (or the house)
  // with a free spot on top.
  function pOnTop(n, room) {
    var hosts = (PLACE_ON[n.kind] || "").split(" ").filter(Boolean);
    var pool = hand.nodes.filter(function (m) { return !room || insideArea(room, m.x, m.y); });
    for (var i = 0; i < hosts.length; i++) {
      var hs = pool.filter(function (m) { return m.kind === hosts[i]; });
      for (var j = 0; j < hs.length; j++) {
        var h = hs[j], taken = hand.nodes.filter(function (m) { return m !== n && ON_TOP[m.kind] && insideArea(h, m.x, m.y); }).map(pOf);
        var hq = turned(h), nq = turned(n);
        for (var f = 0; f <= 4; f++) {
          var off = [0, -0.3, 0.3, -0.15, 0.15][f] * Math.max(0, hq.w - nq.w);
          var spot = hq.w >= hq.h ? { x: h.x + off, y: h.y } : { x: h.x, y: h.y + off };
          var me = pRect(spot.x, spot.y, nq.w, nq.h);
          if (!taken.some(function (t) { return pMeet(me, t, 0); })) { return { x: spot.x, y: spot.y, turn: h.turn || 0 }; }
        }
      }
    }
    return null;
  }
  // On a wall: by the thing it goes with, or the room's longest free wall;
  // snapToWalls (03-icons.js) then hangs it square.
  function pOnWall(n, room) {
    var all = hand.nodes.filter(function (m) { return m !== n && insideArea(room, m.x, m.y); });
    var by = { i_picture: "i_sofa i_bed i_bedking i_loveseat i_sectional i_dining i_desk", i_hood: "i_stove",
               i_medicine: "i_sink i_vanity", i_mirror: "i_vanity i_sink i_dresser", i_shelf: "i_desk i_sofa",
               i_cabinet: "i_counter i_kitchensink", i_sconce: "i_bed i_bedking", i_towelrail: "i_bathtub i_shower i_vanity",
               i_walltv: "", i_proscreen: "", i_radiator: "", i_ac: "", i_wallclock: "", i_hooks: "" }[n.kind];
    var ks = (by || "").split(" ").filter(Boolean);
    for (var i = 0; i < ks.length; i++) {
      var h = all.filter(function (m) { return m.kind === ks[i]; })[0];
      if (h) {                           // its back wall: a little behind the host, over it
        var back = v3LocalPt(h, 0, -h.h / 2 - 2);
        return { x: back[0], y: back[1] };
      }
    }
    if (n.kind === "i_walltv" || n.kind === "i_proscreen") {
      var sofa = all.filter(function (m) { return /i_sofa|i_loveseat|i_sectional/.test(m.kind); })[0];
      if (sofa) { return pBesideFace(sofa, room); }
    }
    // the middle of the longest wall with nothing hung on it yet
    var box = pInner(room), hung = all.filter(function (m) { return SNAP_IN_WALL[m.kind]; }).map(pOf);
    var walls = [{ x: room.x, y: box.t + 1, len: box.r - box.l }, { x: room.x, y: box.b - 1, len: box.r - box.l },
                 { x: box.l + 1, y: room.y, len: box.b - box.t }, { x: box.r - 1, y: room.y, len: box.b - box.t }];
    walls.sort(function (a, b) { return b.len - a.len; });
    for (var w = 0; w < walls.length; w++) {
      var here = pRect(walls[w].x, walls[w].y, n.w, n.w);
      if (!hung.some(function (o) { return pMeet(here, o, 2); })) { return { x: walls[w].x, y: walls[w].y }; }
    }
    return { x: walls[0].x, y: walls[0].y };
  }
  function pBesideFace(sofa, room) {
    var ft = (sofa.turn || 0) * Math.PI / 180, fx = -Math.sin(ft), fy = Math.cos(ft), box = pInner(room);
    if (Math.abs(fx) > 0.5) { return { x: fx > 0 ? box.r - 1 : box.l + 1, y: sofa.y }; }
    return { x: sofa.x, y: fy > 0 ? box.b - 1 : box.t + 1 };
  }
  // A door or a window: a wall of the room with none in it -- a window on
  // an outside wall, a door on one shared with another room if there is
  // one -- at the middle of its free run.
  function pInWall(n, room) {
    var box = pInner(room), T = roomWallOf(room), others = pRooms().filter(function (r) { return r !== room; });
    var walls = [{ side: "top", x: room.x, y: box.t - T / 2, len: box.r - box.l, out: [0, -1] },
                 { side: "foot", x: room.x, y: box.b + T / 2, len: box.r - box.l, out: [0, 1] },
                 { side: "left", x: box.l - T / 2, y: room.y, len: box.b - box.t, out: [-1, 0] },
                 { side: "right", x: box.r + T / 2, y: room.y, len: box.b - box.t, out: [1, 0] }];
    var holes = hand.nodes.filter(function (m) { return m !== n && (WALK_DOORS[m.kind] || m.kind === "i_window"); });
    var door = !!WALK_DOORS[n.kind] && n.kind !== "i_garagedoor", need = n.w + 0.3 * FLOOR_PX;
    walls.forEach(function (w) {
      var probe = [w.x + w.out[0] * (T + 8), w.y + w.out[1] * (T + 8)];
      w.shared = others.some(function (o) { return insideArea(o, probe[0], probe[1]); });
      // what is in this wall already, as runs along it -- and the longest
      // stretch left between them, and the corners
      var taken = [], from = -w.len / 2 + 0.25 * FLOOR_PX, to = w.len / 2 - 0.25 * FLOOR_PX;
      holes.forEach(function (m) {
        if (Math.abs(w.out[0] ? m.x - w.x : m.y - w.y) > T + Math.max(m.w, m.h) / 2 + 2) { return; }
        var at = w.out[0] ? m.y - w.y : m.x - w.x, half = Math.max(m.w, m.h) / 2 + 0.2 * FLOOR_PX;
        if (Math.abs(at) < w.len / 2 + half) { taken.push([at - half, at + half]); }
      });
      w.doored = holes.some(function (m) { return WALK_DOORS[m.kind] && Math.abs(w.out[0] ? m.x - w.x : m.y - w.y) <= T + Math.max(m.w, m.h) / 2 + 2 &&
                                                  Math.abs(w.out[0] ? m.y - w.y : m.x - w.x) < w.len / 2; });
      taken.sort(function (a, b) { return a[0] - b[0]; });
      var best = null, at0 = from;
      taken.concat([[to, to]]).forEach(function (t) {
        var gap = Math.min(t[0], to) - at0;
        if (gap >= need && (!best || gap > best.gap)) { best = { gap: gap, mid: (at0 + Math.min(t[0], to)) / 2 }; }
        at0 = Math.max(at0, t[1]);
      });
      w.free = best;
    });
    walls = walls.filter(function (w) { return w.free && (!door || !w.doored || !w.shared); });
    if (!walls.length) { return { x: room.x, y: box.t - T / 2 }; }
    walls.sort(function (a, b) {
      function rank(w) { return (door ? (w.shared ? 0 : 1) : (w.shared ? 4 : 0)) - w.free.gap / 1000; }
      return rank(a) - rank(b);
    });
    var w0 = walls[0], along = w0.free.mid;
    var x = w0.out[0] ? w0.x : w0.x + along, y = w0.out[0] ? w0.y + along : w0.y;
    return { x: x - w0.out[0] * n.h * 0.3, y: y - w0.out[1] * n.h * 0.3 };
  }
  // Out in the yard: on the lot, off the house, a little way from it.
  function pInYard(n) {
    var lot = hand.nodes.filter(function (m) { return m.kind === "i_lot"; })[0];
    var rooms = pRooms(), house = null;
    rooms.forEach(function (r) { var q = pOf(r); house = house ? { l: Math.min(house.l, q.l), r: Math.max(house.r, q.r), t: Math.min(house.t, q.t), b: Math.max(house.b, q.b) } : q; });
    var area = lot ? pOf(lot) : house ? { l: house.l - 300, r: house.r + 300, t: house.t - 300, b: house.b + 300 } : null;
    if (!area) { return null; }
    var taken = hand.nodes.filter(function (m) { return m !== n && m.kind !== "i_lot" && m.kind !== "i_floor" && !LIES_FLAT[m.kind] && !isArea(m.kind) || m.kind === "i_room"; }).map(pOf);
    var q = turned(n), best = null;
    for (var y = area.t + q.h / 2 + 10; y <= area.b - q.h / 2 - 10; y += 10) {
      for (var x = area.l + q.w / 2 + 10; x <= area.r - q.w / 2 - 10; x += 10) {
        var me = pRect(x, y, q.w, q.h);
        if (taken.some(function (t) { return pMeet(me, t, 0.8 * FLOOR_PX); })) { continue; }
        // the back yard (the lot's top, away from the street) for what is
        // sat out in; nearer the house for what grows round it
        var d = house ? Math.hypot(x - (house.l + house.r) / 2, y - (house.t + house.b) / 2) : 0;
        var score = -d * (n.kind === "i_shrub" || n.kind === "i_flowerbed" || n.kind === "i_hedge" ? 1 : 0.4) - (y - area.t) * 0.3;
        if (!best || score > best.s) { best = { x: x, y: y, s: score }; }
      }
    }
    return best;
  }
  // The middle of what is on screen, on the paper.
  function pInView() {
    var stage = el("#stage"), chart = el("#chart");
    if (!stage || !chart || !chart.getScreenCTM || !chart.getScreenCTM()) { return null; }
    var r = stage.getBoundingClientRect(), p = chart.createSVGPoint();
    p.x = r.left + r.width / 2; p.y = r.top + r.height / 2;
    return onHand(p.matrixTransform(chart.getScreenCTM().inverse()));
  }
  // Puts the new piece n in its place; true if it moved.
  function placeWell(n, before) {
    var kind = n.kind;
    if (!ICONS[kind] || ICONS[kind].fig || isArea(kind) || kind === "i_lot" || kind === "i_room" || kind === "i_floor") { return false; }
    var outdoors = (ICON_SET_OF[kind] === "ic_outdoor" && kind !== "i_parked") || PLACE_OUTSIDE[kind];
    if (outdoors) {
      var yard = pInYard(n);
      if (yard) { n.x = Math.round(yard.x); n.y = Math.round(yard.y); return true; }
      return false;
    }
    var room = pRoomFor(kind, before);
    if (!room) {                         // no rooms yet: where it is seen
      var mid = pInView();
      if (mid) { n.x = Math.round(mid.x); n.y = Math.round(mid.y); return true; }
      return false;
    }
    if ((room.turn || 0) % 90) { n.x = room.x; n.y = room.y; return true; }
    if (placeIn(n, room, false)) { return true; }
    // no room for it there: another room it could go in -- never an oven
    // in the bathroom -- and if none has room, where it was going anyway
    var plan = typeof walkPlan === "function" ? walkPlan() : null, want = PLACE_ROOM_OF[kind];
    function kindOf(r) { try { return plan ? roomKind(plan, r) : "room"; } catch (e) { return "room"; } }
    var order = want ? [want].concat(PLACE_ALSO[want] || []) : [];
    var fits = want ? PLACE_FITS[want] || order : null;
    var rest = pRooms().filter(function (r) {
      if (r === room || (r.turn || 0) % 90) { return false; }
      var k = kindOf(r);
      return fits ? fits.indexOf(k) >= 0 : ["bath", "garage", "closet", "laundry"].indexOf(k) < 0;
    }).sort(function (a, b) {
      function rank(r) { var i = order.indexOf(kindOf(r)); return i < 0 ? 10 : i; }
      return rank(a) - rank(b);
    });
    for (var i = 0; i < rest.length; i++) { if (placeIn(n, rest[i], true)) { return true; } }
    return placeIn(n, room, false, true);
  }
  // In this room, if there is a place for it; `strict` asks for a clear
  // one, `anyhow` puts it in the room's middle when there is none.
  function placeIn(n, room, strict, anyhow) {
    var kind = n.kind;
    var solids = pSolids(room, n), open = pOpenings(room);
    function put(c) {
      n.x = Math.round(c.x * 2) / 2; n.y = Math.round(c.y * 2) / 2;
      if (c.turn !== undefined) { if (c.turn % 360) { n.turn = c.turn % 360; } else { delete n.turn; } }
      return true;
    }
    if (SNAP_IN_WALL[kind] && !ON_TOP[kind]) {
      var wallAt = SNAP_IN_WALL[kind] === "face" ? pOnWall(n, room) : pInWall(n, room);
      put(wallAt);
      snapToWalls([n.id]);
      return true;
    }
    if (ON_TOP[kind]) {
      var top = pOnTop(n, room) || pOnTop(n, null);
      if (top) { return put(top); }
    }
    if (FROM_CEILING[kind]) {
      var over = hand.nodes.filter(function (m) { return insideArea(room, m.x, m.y) && /i_dining|i_roundtable|i_island|i_coffee/.test(m.kind); })[0];
      return put({ x: over ? over.x : room.x, y: over ? over.y : room.y });
    }
    // beside what it goes with, if that spot is clear
    var beside = pBeside(n, room, solids).filter(function (c) {
      var q = c.turn % 180 ? { w: n.h, h: n.w } : { w: n.w, h: n.h };
      c.w = q.w; c.h = q.h;
      return pClear(c, room, n, solids, open, true);
    });
    if (beside.length) { return put(beside[0]); }
    // back to a wall, into a corner, or out in the room: the best clear spot,
    // at its own size -- then shorter, if it can be -- then anywhere clear
    // [across, deep]: its own size first, then narrower, then shallower too
    var sizes = PLACE_SHRINK[kind] ? [[1, 1], [0.88, 1], [0.76, 1], [1, 0.8], [0.88, 0.8], [0.76, 0.8], [0.64, 0.8], [0.76, 0.65], [0.64, 0.65]]
                                   : [[1, 1]];
    for (var pass = 0; pass < (strict ? 1 : 2); pass++) {
      for (var s = 0; s < sizes.length; s++) {
        var w = n.w * sizes[s][0], d = n.h * sizes[s][1], cands;
        if (PLACE_WALL[kind] || PLACE_CORNER[kind]) { cands = pWallSpots(room, n, w, d); }
        else {
          cands = [];
          var box = pInner(room);
          for (var y = box.t + d / 2; y <= box.b - d / 2; y += 6) {
            for (var x = box.l + w / 2; x <= box.r - w / 2; x += 6) { cands.push({ x: x, y: y, turn: n.turn || 0, w: w, h: d }); }
          }
          if (PLACE_MIDDLE[kind] && n.w > n.h * 1.3 && (box.b - box.t) > (box.r - box.l)) {     // long, in a long room: along it
            cands = cands.concat(cands.map(function (c) { return { x: c.x, y: c.y, turn: 90, w: d, h: w }; }));
          }
        }
        var ok = cands.filter(function (c) { return pClear(c, room, n, solids, open, pass > 0); });
        if (ok.length) {
          ok.forEach(function (c) { c.s = pScore(c, room, n, solids, open); });
          ok.sort(function (a, b) { return b.s - a.s; });
          if (sizes[s][0] < 1) { n.w = Math.round(n.w * sizes[s][0]); n.own = true; }
          if (sizes[s][1] < 1) { n.h = Math.round(n.h * sizes[s][1]); n.own = true; }
          return put(ok[0]);
        }
      }
    }
    if (!anyhow) { return false; }
    // nowhere clear: the nearest spot that is -- in the room if there is
    // one -- never on top of what is already there, which would be shoved
    // aside for it (keepApart, 13-hand-apart.js)
    put({ x: room.x, y: room.y });
    function clearAt(x, y) {
      var me = pRect(x, y, turned(n).w, turned(n).h);
      return !hand.nodes.some(function (m) { return m !== n && isSolid(m.kind) && pMeet(me, pOf(m), 2); });
    }
    if (typeof freeSpot === "function" && !clearAt(n.x, n.y)) {
      var spot = freeSpot(n, 30, function (x, y) { return insideArea(room, x, y) && clearAt(x, y); }) ||
                 freeSpot(n, 60, clearAt);
      if (spot) { n.x = spot.x; n.y = spot.y; }
    }
    return true;
  }
  // Off the screen where it went: the view glides over to it.
  function showPlaced(n) {
    var g = el('#chart [data-i="h' + n.id + '"]'), stage = el("#stage");
    if (!g || !stage || typeof glideTo !== "function") { return; }
    var r = g.getBoundingClientRect(), s = stage.getBoundingClientRect();
    if (r.left >= s.left && r.right <= s.right && r.top >= s.top && r.bottom <= s.bottom) { return; }
    glideTo(n.x + handOrigin.x, n.y + handOrigin.y, undefined, 420);
  }
  var addNodePlacing = typeof addNode === "function" ? addNode : null;
  if (addNodePlacing) { addNode = function (kind, at) {
    var before = nodeById(picked), out = addNodePlacing.apply(this, arguments);
    if (at || !designMode()) { return out; }
    var n = nodeById(picked);
    if (!n || n.kind !== kind) { return out; }
    var moved = false;
    try { moved = placeWell(n, before && before !== n ? before : null); } catch (e) { moved = false; }
    if (moved) {
      keepIn(n);
      drawHand();
      drawHandPanel();
      showPlaced(n);
    }
    return out;
  }; }
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
    // what it is made of: a room's floor and walls, and the house's
    // outside and roof; a piece's finish (38-models.js)
    if (n.kind === "i_room") { matSection(box, n); }
    else if (typeof MODELS === "object" && MODELS[n.kind]) { finishSection(box, n); }

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
    if (linksWanted(n)) {
      var join = document.createElement("button");
      join.type = "button";
      join.className = "btn small dz-join" + (joining ? " primary" : "");
      join.textContent = joining ? TXT.connect_now : TXT.connect;
      join.onclick = function () { joining = !joining; joinFrom = null; drawHand(); drawHandPanel(); };
      acts.insertBefore(join, acts.firstChild);
    }
    box.appendChild(acts);
  }

  // ============================================================ materials ==
  // What a house is made of, picked (HOUSE_MATS, 38-models.js): each part a
  // row of tiles, each tile a little of the material itself, the first the
  // way it is when nothing is picked; under the one picked, the colors it
  // comes in.  The outside walls and the roof are the whole house's.  The
  // same rows are in the 3D view, beside what they change.
  var MAT_PARTS = { floor: "mt_floor", wall: "mt_wall", out: "mt_out", roof: "mt_roof" };
  var matPics = {};
  // A tile's picture: the pattern the shader draws, small, in a canvas.
  function matSwatch(part, kind, color) {
    var key = part + "|" + kind + "|" + color;
    if (matPics[key]) { return matPics[key]; }
    var S = 44, c = document.createElement("canvas");
    c.width = c.height = S;
    var g = c.getContext("2d"), rnd = mRand(kind.length * 31 + part.length);
    g.fillStyle = color; g.fillRect(0, 0, S, S);
    function shade(k) { return mShade(color, k); }
    function line(x0, y0, x1, y1, col, w) { g.strokeStyle = col; g.lineWidth = w || 1; g.beginPath(); g.moveTo(x0, y0); g.lineTo(x1, y1); g.stroke(); }
    function speckle(n, k) { for (var i = 0; i < n; i++) { g.fillStyle = shade((rnd() - 0.5) * k); g.fillRect(rnd() * S, rnd() * S, 1.4, 1.4); } }
    var y, x, r, i;
    if (kind === "boards" && part === "floor") {
      for (y = 0; y < S; y += 7) { g.fillStyle = shade((rnd() - 0.5) * 0.12); g.fillRect(0, y, S, 7); line(0, y, S, y, shade(-0.25)); line((y * 7) % S, y, (y * 7) % S, y + 7, shade(-0.25)); }
    } else if (kind === "parquet") {
      for (y = 0; y < S; y += 11) { for (x = 0; x < S; x += 11) {
        var across = ((x + y) / 11) % 2;
        for (i = 0; i < 3; i++) { g.fillStyle = shade((rnd() - 0.5) * 0.16); if (across) { g.fillRect(x + i * 3.7, y, 3.7, 11); } else { g.fillRect(x, y + i * 3.7, 11, 3.7); } }
        g.strokeStyle = shade(-0.25); g.strokeRect(x + 0.5, y + 0.5, 11, 11);
      } }
    } else if (kind === "tiles" && part === "floor") {
      for (y = 0; y <= S; y += 11) { line(0, y, S, y, shade(-0.18), 1.2); line(y, 0, y, S, shade(-0.18), 1.2); }
    } else if (kind === "marble") {
      for (i = 0; i < 3; i++) { g.strokeStyle = shade(-0.18); g.lineWidth = 0.8; g.beginPath(); g.moveTo(0, rnd() * S); g.bezierCurveTo(S * 0.3, rnd() * S, S * 0.6, rnd() * S, S, rnd() * S); g.stroke(); }
      line(S / 2, 0, S / 2, S, shade(-0.08));
    } else if (kind === "slate" && part === "floor") {
      for (y = 0; y < S; y += 15) { for (x = 0; x < S; x += 15) { g.fillStyle = shade((rnd() - 0.5) * 0.3); g.fillRect(x + 0.6, y + 0.6, 14, 14); } }
    } else if (kind === "carpet" || kind === "concrete" || kind === "stucco") {
      speckle(kind === "carpet" ? 420 : 160, kind === "carpet" ? 0.22 : 0.14);
    } else if (kind === "wallpaper") {
      for (x = 0; x < S; x += 8) { g.fillStyle = shade(-0.06); g.fillRect(x, 0, 4, S); }
    } else if (kind === "panels" || (kind === "boards" && part === "out")) {
      for (x = 0; x < S; x += kind === "panels" ? 7 : 11) { line(x, 0, x, S, shade(-0.25), kind === "panels" ? 1 : 2.2); }
    } else if (kind === "tiles" && part === "wall") {
      for (y = 0, r = 0; y < S; y += 5.5, r++) { line(0, y, S, y, shade(-0.15)); for (x = (r % 2) * 5.5; x < S; x += 11) { line(x, y, x, y + 5.5, shade(-0.15)); } }
    } else if (kind === "brick") {
      g.fillStyle = "#cfcac0"; g.fillRect(0, 0, S, S);
      for (y = 0, r = 0; y < S; y += 5, r++) { for (x = (r % 2) * -6; x < S; x += 12) { g.fillStyle = shade((rnd() - 0.5) * 0.25); g.fillRect(x + 0.6, y + 0.6, 11, 4); } }
    } else if (kind === "stone") {
      g.fillStyle = shade(-0.4); g.fillRect(0, 0, S, S);
      for (y = 0; y < S; y += 9) { for (x = -rnd() * 8; x < S; x += 9 + rnd() * 8) { var w = 8 + rnd() * 7; g.fillStyle = shade((rnd() - 0.5) * 0.3); g.fillRect(x + 0.7, y + 0.7, w - 1.4, 7.6); } }
    } else if (kind === "siding") {
      for (y = 0; y < S; y += 6) { g.fillStyle = shade(-0.12); g.fillRect(0, y + 4.6, S, 1.4); }
    } else if (kind === "shakes" || kind === "shingles" || (kind === "slate" && part === "roof")) {
      var rowH = kind === "shingles" ? 8 : kind === "shakes" ? 9 : 6;
      for (y = 0, r = 0; y < S; y += rowH, r++) {
        for (x = (r % 2) * -5; x < S; x += kind === "shakes" ? 5 + rnd() * 6 : 10) {
          g.fillStyle = shade((rnd() - 0.5) * 0.24); g.fillRect(x + 0.5, y, kind === "shakes" ? 5 : 9.5, rowH - 1);
        }
        g.fillStyle = shade(-0.3); g.fillRect(0, y + rowH - 1, S, 1);
      }
    } else if (kind === "tiles" && part === "roof") {
      for (y = 0; y < S; y += 8) { for (x = 0; x < S; x += 8) {
        var grd = g.createLinearGradient(x, 0, x + 8, 0);
        grd.addColorStop(0, shade(-0.25)); grd.addColorStop(0.5, shade(0.12)); grd.addColorStop(1, shade(-0.25));
        g.fillStyle = grd; g.fillRect(x, y, 8, 7);
      } g.fillStyle = shade(-0.35); g.fillRect(0, y + 7, S, 1); }
    } else if (kind === "metal") {
      for (x = 4; x < S; x += 9) { line(x, 0, x, S, shade(0.25), 1.6); line(x + 1.5, 0, x + 1.5, S, shade(-0.2)); }
    // (added 2026-10-01: "add more textures")
    } else if (kind === "herringbone") {
      // planks four to one, each row of the zigzag stepped one along, laid on the slant
      g.save(); g.translate(S / 2, S / 2); g.rotate(Math.PI / 4);
      for (var cy = -9; cy <= 9; cy++) { for (var cx = -9; cx <= 9; cx++) {
        var d = (((cx - cy) % 8) + 8) % 8, ix = d < 4 ? cx - d : cx, iy = d < 4 ? cy : cy - (7 - d);
        var hsh = (((ix * 73856093) ^ (iy * 19349663)) >>> 0) % 100 / 100;
        g.fillStyle = shade((hsh - 0.5) * 0.24); g.fillRect(cx * 4, cy * 4, 4, 4);
      } }
      g.restore();
    } else if (kind === "hextiles") {
      g.fillStyle = shade(-0.28); g.fillRect(0, 0, S, S);
      for (y = 0, r = 0; y < S + 9; y += 7.8, r++) { for (x = (r % 2) * 4.5; x < S + 9; x += 9) {
        g.fillStyle = shade((rnd() - 0.5) * 0.08); g.beginPath();
        for (i = 0; i < 6; i++) { var an = Math.PI / 6 + i * Math.PI / 3; g.lineTo(x + Math.cos(an) * 4.4, y + Math.sin(an) * 4.4); }
        g.fill();
      } }
    } else if (kind === "checker") {
      var lum = mLum(color), other = lum > 0.45 ? mShade(color, -0.82) : mShade(color, 0.85);
      for (y = 0; y < S; y += 11) { for (x = 0; x < S; x += 11) { if (((x + y) / 11) % 2) { g.fillStyle = other; g.fillRect(x, y, 11, 11); } } }
    } else if (kind === "terrazzo") {
      speckle(120, 0.08);
      for (i = 0; i < 70; i++) { g.fillStyle = "hsl(" + Math.round(rnd() * 360) + ",25%," + Math.round(40 + rnd() * 40) + "%)"; g.fillRect(rnd() * S, rnd() * S, 1.6 + rnd() * 1.6, 1.4 + rnd() * 1.4); }
    } else if (kind === "cork") {
      speckle(600, 0.4);
      for (y = 0; y <= S; y += 22) { line(0, y, S, y, shade(-0.25)); line(y, 0, y, S, shade(-0.25)); }
    } else if (kind === "plaster") {
      for (i = 0; i < 14; i++) { g.fillStyle = shade((rnd() - 0.5) * 0.12); g.globalAlpha = 0.5; g.beginPath(); g.arc(rnd() * S, rnd() * S, 5 + rnd() * 9, 0, 7); g.fill(); }
      g.globalAlpha = 1;
    } else if (kind === "shiplap") {
      for (y = 0; y < S; y += 7) { g.fillStyle = shade((rnd() - 0.5) * 0.06); g.fillRect(0, y, S, 7); line(0, y + 0.5, S, y + 0.5, shade(-0.35), 1.2); }
    } else if (kind === "beadboard") {
      for (x = 0; x < S; x += 3.5) { line(x, 0, x, S, shade(-0.18)); }
    } else if (kind === "logs") {
      for (y = 0; y < S; y += 11) {
        var lg = g.createLinearGradient(0, y, 0, y + 11);
        lg.addColorStop(0, shade(-0.4)); lg.addColorStop(0.5, shade(0.1)); lg.addColorStop(1, shade(-0.4));
        g.fillStyle = lg; g.fillRect(0, y, S, 11);
      }
    } else if (kind === "cladding") {
      for (y = 0, r = 0; y < S; y += 11, r++) { for (x = (r % 2) * 11; x < S + 22; x += 22) {
        g.fillStyle = shade((rnd() - 0.5) * 0.08); g.fillRect(x - 22, y, 21.4, 10.4);
      } }
    } else if (kind === "corrugated") {
      for (x = 0; x < S; x += 4) {
        var cg = g.createLinearGradient(x, 0, x + 4, 0);
        cg.addColorStop(0, shade(-0.22)); cg.addColorStop(0.5, shade(0.18)); cg.addColorStop(1, shade(-0.22));
        g.fillStyle = cg; g.fillRect(x, 0, 4, S);
      }
    } else if (kind === "thatch") {
      for (i = 0; i < 260; i++) { var tx = rnd() * S, ty = rnd() * S; line(tx, ty, tx + (rnd() - 0.5) * 2, ty + 5, shade((rnd() - 0.5) * 0.45)); }
      for (y = 10; y < S; y += 12) { line(0, y, S, y, shade(-0.3), 1.4); }
    } else if (kind === "green") {
      speckle(500, 0.5);
      for (i = 0; i < 18; i++) { g.fillStyle = "#e0c85a"; g.fillRect(rnd() * S, rnd() * S, 1.6, 1.6); }
    } else if (kind === "solar") {
      g.fillStyle = "#c8cdd2"; g.fillRect(0, 0, S, S);
      for (y = 1, r = 0; y < S; y += 14, r++) { for (x = 1; x < S; x += 21) {
        g.fillStyle = color; g.fillRect(x, y, 19.5, 12.5);
        for (i = 1; i < 4; i++) { line(x + i * 19.5 / 4, y, x + i * 19.5 / 4, y + 12.5, shade(0.18), 0.6); }
        line(x, y + 6.2, x + 19.5, y + 6.2, shade(0.18), 0.6);
      } }
    } else if (kind === "timber") {
      // half-timbered: dark oak posts, rails and a brace or two over the plaster
      speckle(80, 0.06);
      g.fillStyle = "#3a2a20";
      for (x = 1; x < S; x += 14) { g.fillRect(x, 0, 3, S); }
      for (y = 0; y < S; y += 21) { g.fillRect(0, y, S, 3); }
      line(4, 3, 15, 21, "#3a2a20", 2.6); line(29, 24, 18, 42, "#3a2a20", 2.6);
    } else if (kind === "woodshakes") {
      for (y = 0, r = 0; y < S; y += 9, r++) {
        for (x = (r % 2) * -5; x < S; x += 5 + rnd() * 6) { g.fillStyle = shade((rnd() - 0.5) * 0.24); g.fillRect(x + 0.5, y, 5, 8); }
        g.fillStyle = shade(-0.3); g.fillRect(0, y + 8, S, 1);
      }
    }
    return (matPics[key] = c.toDataURL());
  }
  // How light a color is, 0 to 1 (the checker's other tile is the other way).
  function mLum(color) {
    var m = /^#?([0-9a-f]{2})([0-9a-f]{2})([0-9a-f]{2})$/i.exec(String(color || ""));
    return m ? (0.3 * parseInt(m[1], 16) + 0.59 * parseInt(m[2], 16) + 0.11 * parseInt(m[3], 16)) / 255 : 0.5;
  }
  // A material painted any color at all, as the picker moves: no Undo of
  // its own each step (the swatch keeps one for the whole visit), saved
  // once the picker is put away.
  function matPaint(room, part, kind, color) {
    var whole = part === "out" || part === "roof";
    (whole ? hand.nodes.filter(function (r) { return r.kind === "i_room"; }) : [room]).forEach(function (r) {
      var m = Object.assign({}, r.mat || {});
      m[part] = kind; m[part + "C"] = color;
      r.mat = m;
    });
    if (V3) { V3.dirty = true; }
  }
  function matName(part, kind) {
    var key = part === "roof" ? "mtr_" + kind : part === "out" && kind === "boards" ? "mt_batten" : "mt_" + kind;
    return TXT[key] || kind;
  }
  // the look a part has when nothing is picked for it
  function matPlain(part, room) {
    if (part === "floor") {
      var k = "room";
      try { k = roomKind(v3GroundPlan(), room); } catch (e) { k = "room"; }
      return k === "bath" || k === "kitchen" || k === "laundry" ? ["tiles", "#dfe2e4"] : k === "garage" ? ["concrete", "#a8a8a4"] : ["boards", "#b98d63"];
    }
    return part === "wall" ? ["paint", "#f2efe8"] : part === "out" ? ["siding", "#ede8dc"] : ["shingles", "#5d6166"];
  }
  function v3GroundPlan() { return typeof walkPlan === "function" ? walkPlan() : { pieces: [], rooms: [] }; }
  // Set on a room -- or, for the outside and the roof, on every room.
  function setMat(room, part, kind, color) {
    keepUndo();
    var whole = part === "out" || part === "roof";
    (whole ? hand.nodes.filter(function (r) { return r.kind === "i_room"; }) : [room]).forEach(function (r) {
      var m = Object.assign({}, r.mat || {});
      if (kind) { m[part] = kind; if (color) { m[part + "C"] = color; } else { delete m[part + "C"]; } }
      else { delete m[part]; delete m[part + "C"]; }
      if (Object.keys(m).length) { r.mat = m; } else { delete r.mat; }
    });
    if (typeof handKeep === "function") { handKeep(); }
    if (V3) { V3.dirty = true; }
  }
  // One part's row: its name and what it is now, its tiles, its colors.
  function matRow(room, part, redraw, bare) {
    var row = document.createElement("div");
    row.className = "dz-mat";
    var now = houseMat(room, part), plain = matPlain(part, room);
    var head = document.createElement("div");
    head.className = "dz-mat-head";
    head.innerHTML = '<span class="dz-small"></span><span class="dz-mat-now"></span>';
    head.firstChild.textContent = TXT[MAT_PARTS[part]] + ((part === "out" || part === "roof") && !bare ? " · " + TXT.mt_house : "");
    head.lastChild.textContent = now ? matName(part, now.kind) : TXT.mt_plain;
    row.appendChild(head);
    var tiles = document.createElement("div");
    tiles.className = "dz-mat-tiles";
    tiles.setAttribute("role", "radiogroup");
    tiles.setAttribute("aria-label", TXT[MAT_PARTS[part]]);
    [[null, plain[0], plain[1]]].concat(Object.keys(HOUSE_MATS[part]).map(function (k) { return [k, k, HOUSE_MATS[part][k][1]]; }))
      .forEach(function (t) {
        var on = t[0] ? !!now && now.kind === t[0] : !now;
        var b = document.createElement("button");
        b.type = "button";
        b.className = "dz-mat-tile" + (on ? " on" : "") + (t[0] ? "" : " plain");
        b.setAttribute("role", "radio");
        b.setAttribute("aria-checked", on ? "true" : "false");
        var name = t[0] ? matName(part, t[0]) : TXT.mt_plain + " (" + matName(part, t[1]) + ")";
        b.title = name;
        b.setAttribute("aria-label", name);
        b.innerHTML = '<span class="dz-mat-pic"></span>';
        b.firstChild.style.backgroundImage = "url(" + matSwatch(part, t[1], on && now ? now.color : t[2]) + ")";
        b.onclick = function () { setMat(room, part, t[0], null); redraw(); };
        tiles.appendChild(b);
      });
    row.appendChild(tiles);
    if (now) {                            // the colors this material comes in
      var tints = document.createElement("div");
      tints.className = "dz-mat-tints";
      houseTints(part, now.kind).forEach(function (col) {
        var chip = document.createElement("button");
        chip.type = "button";
        chip.className = "dz-chip" + (String(now.color).toLowerCase() === col ? " on" : "");
        chip.style.background = col;
        chip.title = col;
        chip.setAttribute("aria-label", matName(part, now.kind) + " " + col);
        chip.onclick = function () { setMat(room, part, now.kind, col); redraw(); };
        tints.appendChild(chip);
      });
      // and any color at all: the material painted that color (asked
      // 2026-10-01: "be able to 'paint' said textures different colors")
      var paint = swatch(now.color, now.color, function (v) { matPaint(room, part, now.kind, v); }, function () {
        if (typeof handKeep === "function") { handKeep(); }
        redraw();
      });
      paint.classList.add("dz-paint");
      paint.title = TXT.mt_any;
      paint.setAttribute("aria-label", matName(part, now.kind) + ": " + TXT.mt_any);
      tints.appendChild(paint);
      row.appendChild(tints);
    }
    return row;
  }
  function matSection(box, room) {
    var sec = document.createElement("div");
    sec.className = "dz-mats";
    function draw() {
      sec.innerHTML = '<div class="dz-small dz-sub-head"></div>';
      sec.firstChild.textContent = TXT.mt_head;
      ["floor", "wall", "out", "roof"].forEach(function (part) { sec.appendChild(matRow(room, part, draw)); });
    }
    draw();
    box.appendChild(sec);
  }

  // ---- a piece's finish -------------------------------------------------------------
  // Its main color -- the fabric of a sofa, the wood of a table, the steel of
  // a fridge -- and its trim: legs, handles, a frame.  Unpicked, each is
  // what such a thing usually is (38-models.js).
  var FIN_MAIN = ["#8f949b", "#c8b9a2", "#5f7690", "#6f8a6a", "#a65a44", "#4a4d52", "#e8e1d3", "#f2f0ea", "#c29a6b", "#6e4a32", "#c9cdd1", "#1d1f22"];
  var FIN_TRIM = ["#c29a6b", "#8a6240", "#4b3627", "#efede8", "#2a2a2a", "#a7adb3", "#c8a35a", "#dfe3e8"];
  function finishSection(box, n) {
    var sec = document.createElement("div");
    sec.className = "dz-fin";
    function draw() {
      sec.innerHTML = '<div class="dz-fin-head"><span class="dz-small dz-sub-head"></span></div>';
      sec.querySelector(".dz-sub-head").textContent = TXT.dz_finish;
      var fin = n.fin || {};
      if (fin.main || fin.frame) {
        var plain = document.createElement("button");
        plain.type = "button";
        plain.className = "dz-link";
        plain.textContent = TXT.mt_plain;
        plain.title = TXT.dz_fin_plain_tip;
        plain.onclick = function () { keepUndo(); delete n.fin; finChanged(); draw(); };
        sec.firstChild.appendChild(plain);
      }
      [["main", "dz_fin_main", FIN_MAIN], ["frame", "dz_fin_trim", FIN_TRIM]].forEach(function (r) {
        var line = document.createElement("div");
        line.className = "dz-fin-row";
        line.innerHTML = '<span class="dz-fin-name"></span><div class="dz-mat-tints"></div>';
        line.firstChild.textContent = TXT[r[1]];
        r[2].forEach(function (col) {
          var chip = document.createElement("button");
          chip.type = "button";
          chip.className = "dz-chip" + ((fin[r[0]] || "").toLowerCase() === col ? " on" : "");
          chip.style.background = col;
          chip.title = col;
          chip.setAttribute("aria-label", TXT[r[1]] + " " + col);
          chip.onclick = function () {
            keepUndo();
            n.fin = Object.assign({}, n.fin || {});
            n.fin[r[0]] = col;
            finChanged(); draw();
          };
          line.lastChild.appendChild(chip);
        });
        // any color at all, from the picker (the swatch keeps the one Undo)
        var paint = swatch(fin[r[0]] || r[2][0], r[2][0], function (v) {
          n.fin = Object.assign({}, n.fin || {});
          n.fin[r[0]] = v;
          if (V3) { V3.dirty = true; }
        }, function () { finChanged(); draw(); });
        paint.classList.add("dz-paint");
        paint.title = TXT.mt_any;
        paint.setAttribute("aria-label", TXT[r[1]] + ": " + TXT.mt_any);
        line.lastChild.appendChild(paint);
        sec.appendChild(line);
      });
    }
    function finChanged() { if (typeof handKeep === "function") { handKeep(); } if (V3) { V3.dirty = true; } }
    draw();
    box.appendChild(sec);
  }

  // ---- in the 3D view --------------------------------------------------------------
  // A Materials button by the others over a house in 3D: the house's
  // outside and roof, and a room's floor and walls -- the room walked in,
  // or one picked from its name -- changed while looking at them.
  var v3OpenPlain = v3Open;
  v3Open = function () {
    var out = v3OpenPlain.apply(this, arguments);
    try { v3MatsButton(); } catch (e) { /* the view works without it */ }
    return out;
  };
  var matsRoom = null;
  function v3MatsButton() {
    if (!V3 || !V3.box || V3.scene === "space") { return; }
    var bar = el(".v3-bar", V3.box);
    if (!bar || el('[data-v3="mats"]', bar)) { return; }
    var btn = document.createElement("button");
    btn.type = "button";
    btn.className = "btn small";
    btn.dataset.v3 = "mats";
    btn.setAttribute("aria-expanded", "false");
    btn.textContent = TXT.mt_button;
    var after = el('[data-v3="labels"]', bar);
    // (after Labels, wherever it is now: the bar puts its buttons in groups, 39-house.js)
    (after ? after.parentNode : bar).insertBefore(btn, after ? after.nextSibling : null);
    var sheet = document.createElement("div");
    sheet.className = "v3-mats";
    sheet.hidden = true;
    sheet.addEventListener("pointerdown", function (ev) { ev.stopPropagation(); });
    sheet.addEventListener("wheel", function (ev) { ev.stopPropagation(); });
    sheet.addEventListener("keydown", function (ev) { if (ev.key !== "Escape") { ev.stopPropagation(); } });
    V3.box.appendChild(sheet);
    // a change here shows in the room's own panel beside the view as well
    function drawBoth() {
      draw();
      try { if (nodeById(picked) && nodeById(picked).kind === "i_room") { drawHandPanel(); } } catch (e) { /* the sheet is what matters */ }
    }
    function draw() {
      var rooms = hand.nodes.filter(function (r) { return r.kind === "i_room"; });
      if (!rooms.length) { sheet.innerHTML = ""; sheet.textContent = TXT.mt_none; return; }
      var here = (V3 && V3.mode === "walk" && V3.inRoom) || (matsRoom && rooms.indexOf(matsRoom) >= 0 ? matsRoom : null) ||
                 nodeById(picked) && nodeById(picked).kind === "i_room" && nodeById(picked) || rooms[0];
      sheet.innerHTML = "";
      var head = document.createElement("div");
      head.className = "v3-mats-head";
      head.textContent = TXT.mt_house;
      // (its own close button, 40-panels.js)
      if (typeof pnCloser === "function") { head.appendChild(pnCloser('[data-v3="mats"]')); }
      sheet.appendChild(head);
      sheet.appendChild(matRow(here, "out", drawBoth, true));
      sheet.appendChild(matRow(here, "roof", drawBoth, true));
      var which = document.createElement("div");
      which.className = "v3-mats-head";
      which.textContent = TXT.mt_room;
      sheet.appendChild(which);
      var pick = document.createElement("div");
      pick.className = "v3-mats-rooms";
      rooms.forEach(function (r) {
        var b = document.createElement("button");
        b.type = "button";
        b.className = "btn small" + (r === here ? " primary" : "");
        b.textContent = roomLabel(r) || kindName("i_room");
        b.onclick = function () { matsRoom = r; draw(); };
        pick.appendChild(b);
      });
      sheet.appendChild(pick);
      sheet.appendChild(matRow(here, "floor", drawBoth));
      sheet.appendChild(matRow(here, "wall", drawBoth));
    }
    btn.onclick = function (ev) {
      ev.stopPropagation();
      sheet.hidden = !sheet.hidden;
      btn.setAttribute("aria-expanded", sheet.hidden ? "false" : "true");
      btn.classList.toggle("primary", !sheet.hidden);
      if (!sheet.hidden) { draw(); }
    };
    sheet.redraw = draw;
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
  // The piece the sizes were last put on: drawn again for the same one --
  // carried, nudged, the paper drawn for any reason -- they stay as they
  // were, rather than fading in again.  (Faded in each time, they flickered
  // while a piece was carried: asked 2026-10-01, "whenever I move the shape
  // and it has the sizes on there they flicker as I move it".)
  var dimsFor = null;
  function dimsArt() {
    var g = chart && chart.querySelector("g.dz-dims-on");
    if (g) { g.remove(); }
    var n = designMode() && chart && many.length <= 1 ? nodeById(picked) : null;
    if (!n || !ICONS[n.kind] || isFigure(n.kind) || quarter(n) === null) { dimsFor = null; return; }
    var parts = sizesOf(n).filter(function (one) { return one.key === "w" || one.key === "h"; });
    if (!parts.length) { dimsFor = null; return; }
    var t = turned(n), ox = handOrigin.x, oy = handOrigin.y;
    var l = n.x - t.w / 2 + ox, r = n.x + t.w / 2 + ox, tp = n.y - t.h / 2 + oy, b = n.y + t.h / 2 + oy;
    var q = quarter(n), GAP = 16, TICK = 5;
    var NS = "http://www.w3.org/2000/svg";
    g = document.createElementNS(NS, "g");
    g.setAttribute("class", "dz-dims-on" + (dimsFor === n.id ? " dz-steady" : ""));
    dimsFor = n.id;
    // Carried inside a room: how far it is from each of the room's walls,
    // as it goes, so it can be put down just so far from one.
    var carried = document.body.classList.contains("carrying-shape");
    var room = carried && n.kind !== "i_room" && !isArea(n.kind) && typeof roomAround === "function" ? roomAround(n) : null;
    if (room && quarter(room) !== null) {
      // (a quarter in from the middle, clear of the pills on its top and side)
      var f = innerOf(room), cy = tp + (b - tp) * 0.75, cx = l + (r - l) * 0.75;
      [[f.l + ox, l, cy, true], [r, f.r + ox, cy, true], [f.t + oy, tp, cx, false], [b, f.b + oy, cx, false]].forEach(function (s) {
        var from = s[0], to = s[1], at = s[2], flat = s[3];
        if (to - from < 2) { return; }
        var gap = document.createElementNS(NS, "g");
        gap.setAttribute("class", "dz-gap");
        var d = flat ? "M" + from + " " + at + "H" + to + "M" + from + " " + (at - 4) + "V" + (at + 4) + "M" + to + " " + (at - 4) + "V" + (at + 4)
                     : "M" + at + " " + from + "V" + to + "M" + (at - 4) + " " + from + "H" + (at + 4) + "M" + (at - 4) + " " + to + "H" + (at + 4);
        // (the one across, under its line: over it, a narrow one ran into the pill at the piece's side)
        gap.innerHTML = '<path d="' + d + '"/><text x="' + (flat ? (from + to) / 2 : at + 5) + '" y="' +
                        (flat ? at + 13 : (from + to) / 2 + 4) + '" text-anchor="' + (flat ? "middle" : "start") + '"></text>';
        gap.querySelector("text").textContent = lenSay((to - from) / FLOOR_PX);
        g.appendChild(gap);
      });
    }
    function line(x1, y1, x2, y2) {
      var p = document.createElementNS(NS, "path");
      p.setAttribute("d", "M" + x1 + " " + y1 + "L" + x2 + " " + y2);
      p.setAttribute("class", "dz-dim-line");
      g.appendChild(p);
    }
    function pill(x, y, one, mark) {
      var said = (mark || "") + lenSay(one.get());
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
    // and how tall it is (a room: its ceiling), under its corner
    var up = sizesOf(n).filter(function (one) { return one.key === "tall" || one.key === "ceil"; })[0];
    if (up) { pill(l + 30, b + GAP, up, "\u2195 "); }
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

  // ---- sizes on the plan --------------------------------------------------------
  // (asked for, 2026-10-01: "you can already see the square feet there but
  // to add length, width, and height to the mix too so you can get accurate
  // with the models")  Under a room's area, its length, its width and how
  // high its ceiling is; under a piece's name, its width, depth and height
  // (iconArt, 03-icons.js) -- in feet and inches, or in metres said once.
  function planDims(n) {
    var P = FLOOR_PX, x = " × ";
    var parts = n.kind === "i_room" || n.kind === "i_floor" ? [n.w / P, n.h / P, ceilOf(n)]
              : [n.w / P, n.h / P].concat(pieceHigh(n) >= 0.03 ? [pieceHigh(n)] : []);
    if (feetHere()) { return parts.map(lenSay).join(x); }
    return parts.map(function (m) {
      var v = Math.round(m * 100) / 100;
      try { return v.toLocaleString(LANG, { maximumFractionDigits: 2 }); } catch (e) { return String(v); }
    }).join(x) + " m";
  }
  // the switch, beside Labels: kept with the drawing's style, like Labels
  function sizesShown() {
    var box = el("#sizes-on");
    if (box && box.checked !== !(style && style.noSizes)) { box.checked = !(style && style.noSizes); }
  }
  if (el("#sizes-on")) {
    el("#sizes-on").onchange = function () {
      keepUndo();
      if (this.checked) { delete style.noSizes; } else { style.noSizes = true; }
      if (byHand) { drawHand(); }
      if (typeof keep === "function") { keep(); }
    };
  }

  var drawHandSized = drawHand;
  drawHand = function () {
    var out = drawHandSized.apply(this, arguments);
    dimsArt();
    dressMaking();
    sizesShown();
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
