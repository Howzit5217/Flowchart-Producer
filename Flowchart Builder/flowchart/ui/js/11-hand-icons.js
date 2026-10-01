// ---------------------------------------------------------------------------
//  11-hand-icons.js -- the library of icons: looked through, searched, and
//  carried onto the paper
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // A hundred and seventy icons do not go in a menu.  They go in a library
  // the way draw.io keeps its own: a box to search them by name, the sets
  // they are sorted into across the top, and every one of them as a tile
  // with its name under it -- pressed, it goes on the paper under whatever
  // is picked; carried, it lands where it is let go.  Under Add a shape it
  // is a button, with the last few icons used beside it, one press away.
  var ICON_RECENT = "flowchart-icons-recent";
  var iconLibAt = { set: "", find: "" };   // where the library was left

  function iconRecent() {
    try {
      return (JSON.parse(localStorage.getItem(ICON_RECENT)) || [])
        .filter(function (kind) { return !!ICONS[kind]; });
    } catch (e) { return []; }
  }
  function iconUsed(kind) {
    var list = [kind].concat(iconRecent().filter(function (k) { return k !== kind; })).slice(0, 12);
    try { localStorage.setItem(ICON_RECENT, JSON.stringify(list)); } catch (e) { /* this visit only */ }
  }

  // What an icon answers to: its name here and in US English, the word it
  // is filed under, and the name of its set.
  function iconAnswers(kind) {
    var en = (typeof ALL === "object" && ALL.en) || {};
    return [kindName(kind), en["n_" + kind] || "", kind.slice(2).replace(/_/g, " "),
            TXT[ICON_SET_OF[kind]] || ""].join(" ").toLowerCase();
  }

  function iconFits(kind, words) {
    var said = iconAnswers(kind);
    return words.every(function (one) { return said.indexOf(one) >= 0; });
  }

  // The library, as one element: put in a menu (openIconLibrary) or in a
  // menu beside a row (iconRow).  `pick` is what a pressed icon does.
  function iconLibrary(pick) {
    var box = document.createElement("div");
    box.className = "icon-lib-in";
    var find = document.createElement("input");
    find.type = "search";
    find.className = "field icon-find";
    find.placeholder = TXT.ic_find;
    find.setAttribute("aria-label", TXT.ic_find);
    find.value = iconLibAt.find;
    box.appendChild(find);
    var sets = document.createElement("div");
    sets.className = "icon-sets";
    sets.setAttribute("role", "group");
    var grid = document.createElement("div");
    grid.className = "icon-grid";
    var none = document.createElement("p");
    none.className = "hint icon-none";
    none.textContent = TXT.ic_none;
    none.hidden = true;

    var chips = [["", TXT.ic_all]];
    if (iconRecent().length) { chips.push(["recent", TXT.ic_recent]); }
    ICON_SETS.forEach(function (set) { chips.push([set[0], TXT[set[0]] || set[0]]); });
    if (iconLibAt.set === "recent" && !iconRecent().length) { iconLibAt.set = ""; }
    chips.forEach(function (chip) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "icon-chip";
      b.textContent = chip[1];
      b.dataset.set = chip[0];
      b.setAttribute("aria-pressed", iconLibAt.set === chip[0] ? "true" : "false");
      b.onclick = function (ev) {
        ev.stopPropagation();
        iconLibAt.set = chip[0];
        all(".icon-chip", sets).forEach(function (c) {
          c.setAttribute("aria-pressed", c === b ? "true" : "false");
        });
        fill();
      };
      sets.appendChild(b);
    });
    box.appendChild(sets);
    box.appendChild(grid);
    box.appendChild(none);

    function shown() {
      var words = find.value.toLowerCase().split(/\s+/).filter(Boolean);
      var kinds;
      if (iconLibAt.set === "recent") { kinds = iconRecent(); }
      else if (iconLibAt.set) {
        kinds = (ICON_SETS.filter(function (s) { return s[0] === iconLibAt.set; })[0] || [0, []])[1];
      } else {
        kinds = [];
        ICON_SETS.forEach(function (s) {
          s[1].forEach(function (k) { if (kinds.indexOf(k) < 0) { kinds.push(k); } });
        });
      }
      return words.length ? kinds.filter(function (k) { return iconFits(k, words); }) : kinds;
    }
    function fill() {
      grid.innerHTML = "";
      var kinds = shown();
      kinds.forEach(function (kind) {
        var cell = document.createElement("button");
        cell.type = "button";
        cell.className = "icon-cell";
        cell.title = kindName(kind);
        cell.setAttribute("aria-label", kindName(kind));
        cell.innerHTML = iconTile(kind, 34) + '<span class="icon-name"></span>';
        cell.lastChild.textContent = kindName(kind);
        lendRow(cell, kind);             // carried onto the paper (20-menu.js)
        var lent = cell.ondragstart;
        cell.ondragstart = function (ev) { iconUsed(kind); lent.call(cell, ev); };
        cell.onclick = function (ev) {
          ev.stopPropagation();
          closeMenu();
          iconUsed(kind);
          pick(kind);
        };
        grid.appendChild(cell);
      });
      none.hidden = !!kinds.length;
    }
    find.addEventListener("input", function () { iconLibAt.find = find.value; fill(); });
    // The menu's own keys (menuKeys) are for its rows; in the box, the
    // keys are the typing's -- but for Escape, and down into the tiles.
    find.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown") {
        var first = el(".icon-cell", grid);
        if (first) { first.focus(); ev.preventDefault(); }
        ev.stopPropagation();
        return;
      }
      if (ev.key === "Enter") {
        var only = el(".icon-cell", grid);
        if (only) { only.click(); }
        ev.preventDefault();
      }
      if (ev.key !== "Escape") { ev.stopPropagation(); }
    });
    // Across the tiles with the arrows, a row at a time up and down.
    grid.addEventListener("keydown", function (ev) {
      var cells = all(".icon-cell", grid), at = cells.indexOf(document.activeElement);
      if (at < 0) { return; }
      var across = Math.max(1, Math.round(grid.clientWidth / (cells[0].offsetWidth || 1)));
      var to = { ArrowRight: at + 1, ArrowLeft: at - 1, ArrowDown: at + across, ArrowUp: at - across }[ev.key];
      if (to === undefined) { return; }
      ev.preventDefault();
      ev.stopPropagation();
      if (to < 0) { find.focus(); return; }
      if (cells[Math.min(to, cells.length - 1)]) { cells[Math.min(to, cells.length - 1)].focus(); }
    });
    fill();
    box.focusFind = function () { find.focus({ preventScroll: true }); find.select(); };
    return box;
  }

  function openIconLibrary(anchor, pick) {
    var r = anchor.getBoundingClientRect();
    var lib = iconLibrary(pick);
    openMenu(r.left, r.bottom + 4, [{ bit: lib }], "icon-lib");
    anchor.setAttribute("aria-expanded", "true");
    if (!COARSE) { lib.focusFind(); }    // a keyboard would pop up over it on a phone
  }

  // A row for the menus that add a shape (the paper's own, 20-menu.js):
  // the library, beside it.
  function iconRow(pick) {
    return { icon: "shapes", name: TXT.ic_open, sub: function () {
      return [{ bit: iconLibrary(pick) }];
    } };
  }

  // Under Add a shape: the button that opens the library, and the icons
  // used last, beside it.
  function iconShelf() {
    var box = el("#adders");
    if (!box) { return; }
    var shelf = document.createElement("div");
    shelf.className = "icon-shelf";
    var open = document.createElement("button");
    open.type = "button";
    open.className = "btn small icon-lib-btn";
    open.setAttribute("aria-haspopup", "dialog");
    open.setAttribute("aria-expanded", "false");
    open.innerHTML = '<svg viewBox="0 0 20 20" aria-hidden="true"><circle cx="6" cy="5.6" r="2.4"/>' +
                     '<path d="M2.4 12.4c0-2.4 1.6-3.8 3.6-3.8s3.6 1.4 3.6 3.8"/>' +
                     '<rect x="11.2" y="3.2" width="6.4" height="6.4" rx="1"/>' +
                     '<path d="M3 15.6h4.6M14.4 11.6l3.2 5.6h-6.4z"/></svg>' +
                     '<span data-w="ic_open"></span>';
    open.lastChild.textContent = TXT.ic_open;
    open.title = TXT.ic_open_tip;
    open.onclick = function (ev) {
      ev.stopPropagation();              // or the click that opened it shuts it
      if (open.getAttribute("aria-expanded") === "true") { closeMenu(); return; }
      openIconLibrary(open, function (kind) { addNode(kind); drawIconShelf(); });
    };
    shelf.appendChild(open);
    var recent = document.createElement("div");
    recent.className = "icon-recent";
    shelf.appendChild(recent);
    box.appendChild(shelf);
    drawIconShelf();
  }

  function drawIconShelf() {
    var recent = el("#adders .icon-recent");
    if (!recent) { return; }
    recent.innerHTML = "";
    iconRecent().slice(0, 5).forEach(function (kind) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn small icon-quick";
      b.title = kindName(kind);
      b.setAttribute("aria-label", kindName(kind));
      b.innerHTML = iconTile(kind, 22);
      b.onclick = function () { addNode(kind); };
      lendAdder(b, kind);                // carried, it lands where it is let go
      recent.appendChild(b);
    });
  }

  // drawAdders (11-hand-panel.js) draws Add a shape afresh whenever the
  // rules change; the library's button goes back under it each time.
  var drawAddersNoIcons = drawAdders;
  drawAdders = function () {
    drawAddersNoIcons.apply(this, arguments);
    iconShelf();
  };

  // A door or a window put down goes into the wall it is put down by
  // (snapToWalls, 03-icons.js): added, and let go of after carrying.
  var addNodeNoSnap = addNode;
  addNode = function (kind, at) {
    var out = addNodeNoSnap.apply(this, arguments);
    if (SNAP_IN_WALL[kind] && picked && snapToWalls([picked])) { drawHand(); }
    return out;
  };
  var settleClearNoSnap = settleClear;
  settleClear = function (ids) {
    snapToWalls(ids || []);
    return settleClearNoSnap.apply(this, arguments);
  };

  // ---- how big it really is ---------------------------------------------------
  // A piece of a plan, a room, a floor or a lot is sized in feet (metres,
  // outside US English) here, not in the paper's pixels; a room or a floor
  // says how high its ceiling is -- its walls are that tall in 3D
  // (38-view3d.js) -- and a lot how far a house keeps from each of its
  // edges, and what that leaves to build on and for a yard (lotMeasure,
  // 03-icons.js).  Asked for, 2026-10-01: "the ability to change the height
  // of the ceilings and to have the ability to input the amount of space
  // you have".
  var shapeSvgNoNode = shapeSvg;
  shapeSvg = function (n) {              // the lot drawn knows what is on it
    iconNode = n.src || null;
    try { return shapeSvgNoNode.apply(this, arguments); } finally { iconNode = null; }
  };

  function realSize(box, node) {
    var per = feetHere() ? 0.3048 : 1, unit = TXT.fp_unit || "m";   // metres in one unit
    var wrap = document.createElement("div");
    wrap.className = "real-size";
    function round(v) { return Math.round(v * 10) / 10; }
    function field(row, label, now, lo, hi, set) {
      var cell = document.createElement("label");
      cell.innerHTML = "<span></span>";
      cell.firstChild.textContent = label + " (" + unit + ")";
      var spin = document.createElement("input");
      spin.type = "number";
      spin.className = "field";
      spin.step = per === 1 ? 0.1 : 0.5;
      spin.min = round(lo / per); spin.max = round(hi / per);
      spin.value = round(now / per);
      var firstTouch = true;
      spin.oninput = function () {
        var want = parseFloat(spin.value);
        if (isNaN(want)) { return; }
        if (firstTouch) { firstTouch = false; keepUndo(); }
        set(Math.max(lo, Math.min(hi, want * per)));   // in metres
        drawHand();
        sums();
      };
      cell.appendChild(spin);
      row.appendChild(cell);
    }
    var head = document.createElement("div");
    head.className = "small-head";
    head.textContent = TXT.fp_real;
    wrap.appendChild(head);
    var sizes = document.createElement("div");
    sizes.className = "trio";
    field(sizes, TXT.width, node.w / FLOOR_PX, 0.05, 400, function (m) { node.w = Math.round(m * FLOOR_PX * 10) / 10; node.own = true; });
    field(sizes, TXT.fp_depth, node.h / FLOOR_PX, 0.05, 400, function (m) { node.h = Math.round(m * FLOOR_PX * 10) / 10; node.own = true; });
    if (node.kind === "i_room" || node.kind === "i_floor") {
      field(sizes, TXT.fp_ceiling, ceilOf(node), 2, 12, function (m) { node.ceil = Math.round(m * 100) / 100; });
    }
    wrap.appendChild(sizes);
    var said = document.createElement("div");
    said.className = "lot-sums";
    if (node.kind === "i_lot") {
      var back = document.createElement("div");
      back.className = "small-head";
      back.textContent = TXT.lot_keep;
      wrap.appendChild(back);
      var keep = document.createElement("div");
      keep.className = "trio";
      var sb = lotSetbacks(node);
      [["front", TXT.lot_front], ["side", TXT.lot_side], ["back", TXT.lot_back]].forEach(function (k) {
        field(keep, k[1], sb[k[0]], 0, 100, function (m) {
          node.lot = node.lot || {};
          node.lot[k[0]] = Math.round(m * 100) / 100;
        });
      });
      wrap.appendChild(keep);
      wrap.appendChild(said);
    }
    // what the lot comes to: the land, the room to build on, the house
    // and the yard
    function sums() {
      if (node.kind !== "i_lot") { return; }
      var m = lotMeasure(node), lines = [
        say("lot_says", { w: lengthSays(node.w), d: lengthSays(node.h), unit: unit, area: areaSays(m.area) }),
        say("lot_build", { w: lengthSays(m.env.w), d: lengthSays(m.env.h), unit: unit, area: areaSays(m.build) }),
        say("lot_house", { area: areaSays(m.house) }) + " · " + say("lot_yard", { area: areaSays(m.yard) })
      ];
      said.innerHTML = "";
      lines.forEach(function (one) {
        var line = document.createElement("div");
        line.textContent = one;
        said.appendChild(line);
      });
    }
    sums();
    // just under the paper sizes -- which, for these, say no more than this
    // does, so only which way round it is stays of them -- before its colors
    var trio = box.querySelector(".trio"), fit = trio && trio.nextSibling;
    if (trio) {
      var cells = trio.querySelectorAll("label");
      if (cells.length === 3) { cells[0].style.display = "none"; cells[1].style.display = "none"; }
    }
    if (fit && fit.parentNode === box) { box.insertBefore(wrap, fit.nextSibling); } else { box.appendChild(wrap); }
  }

  var drawHandPanelUnsized = drawHandPanel;
  drawHandPanel = function () {
    var out = drawHandPanelUnsized.apply(this, arguments);
    var node = nodeById(picked), box = el("#hand-sel");
    if (box && node && ICONS[node.kind] && !isFigure(node.kind) && !linkById(chosen) && many.length <= 1) {
      realSize(box, node);
    }
    return out;
  };

  // ---- the Labels switch -------------------------------------------------------
  // Names on a plan's furniture and rooms (labelArt, 03-icons.js): on unless
  // switched off, which is kept with the drawing's style like Depth is, so
  // Undo and a reset put it back.  They fade in, and fade out before they go.
  function labelsShown() {
    var box = el("#labels-on");
    if (box && box.checked !== planLabelsOn()) { box.checked = planLabelsOn(); }
  }
  var drawHandUnlabeled = drawHand;
  drawHand = function () {
    var out = drawHandUnlabeled.apply(this, arguments);
    labelsShown();
    return out;
  };
  if (el("#labels-on")) {
    el("#labels-on").onchange = function () {
      var on = this.checked, still = typeof STILL !== "undefined" && STILL;
      keepUndo();
      function swap() {
        if (on) { delete style.noLabels; } else { style.noLabels = true; }
        if (byHand) { drawHand(); }
        keep();
        if (on && !still && chart) {
          chart.classList.add("tags-arrive");
          setTimeout(function () { if (chart) { chart.classList.remove("tags-arrive"); } }, 450);
        }
      }
      if (!on && !still && byHand && chart && chart.querySelector("text.tag")) {
        chart.classList.add("tags-leave");
        setTimeout(function () { if (chart) { chart.classList.remove("tags-leave"); } swap(); }, 220);
      } else { swap(); }
    };
  }
