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

  // ---- how the library looks -----------------------------------------------
  // (asked for, 2026-10-02: "the icons menu is better designed UI wise in
  // the main menu and in its sub menu")  Every set has a face -- one of its
  // icons drawn as a line in the color of the words beside it -- and a
  // count.  Every icon is shown on a square of the paper, in its own
  // colors, so it looks in the library the way it will look drawn, on a
  // light page or a dark one.
  var ICON_SET_FACE = { ic_people: "i_doctor", ic_rooms: "i_door", ic_living: "i_sofa", ic_bedroom: "i_bed",
                        ic_kitchen: "i_stove", ic_bath: "i_bathtub", ic_decor: "i_plant", ic_walls: "i_picture",
                        ic_tech: "i_tv", ic_outdoor: "i_shrub", ic_devices: "i_laptop", ic_circuit: "i_bulb",
                        ic_travel: "i_car", ic_space: "i_rocket", ic_things: "i_idea",
                        ic_fitness: "i_treadmill", ic_utility: "i_workbench", ic_store: "i_gondola", ic_power: "i_breaker" };
  var ICON_UI = {
    all: '<rect x="3" y="3" width="5.5" height="5.5" rx="1.3"/><rect x="11.5" y="3" width="5.5" height="5.5" rx="1.3"/>' +
         '<rect x="3" y="11.5" width="5.5" height="5.5" rx="1.3"/><rect x="11.5" y="11.5" width="5.5" height="5.5" rx="1.3"/>',
    recent: '<circle cx="10" cy="10" r="7"/><path d="M10 6.2v4l2.8 1.8"/>',
    find: '<circle cx="8.6" cy="8.6" r="5.2"/><path d="M12.6 12.6 16.8 16.8"/>',
    clear: '<path d="M6.5 6.5l7 7M13.5 6.5l-7 7"/>',
    more: '<path d="M7.8 4.8 13 10l-5.2 5.2"/>',
    browse: '<rect x="2.8" y="3.5" width="14.4" height="13" rx="2"/><path d="M7.4 3.5v13M10.2 7.2h4.4M10.2 10h4.4M10.2 12.8h2.8"/>'
  };
  function iconUi(name, cls) {
    return '<svg class="' + (cls || "iu") + '" viewBox="0 0 20 20" aria-hidden="true">' + ICON_UI[name] + "</svg>";
  }

  // An icon as a line in the color of the words round it: a set's face.
  function iconGlyph(kind, size) {
    var icon = ICONS[kind], w = size, h = size;
    if (!icon) { return ""; }
    if (!icon.fig) {
      var s = Math.min((size - 2) / icon.box[0], (size - 2) / icon.box[1]);
      w = icon.box[0] * s; h = icon.box[1] * s;
    }
    var art = iconArt(kind, size / 2, size / 2, w, h, "none")
      .replace(/class="inked" fill="#000000"/g, 'class="inked" fill="currentColor"')
      .replace(/class="gap" fill="[^"]*"/g, 'class="gap" fill="none"')
      .replace(/<text[\s\S]*?<\/text>/g, "");
    return '<svg class="icon-glyph" width="' + size + '" height="' + size + '" viewBox="0 0 ' + size + " " + size +
           '" fill="none" stroke="currentColor" stroke-width="1.2" stroke-linecap="round" ' +
           'stroke-linejoin="round" aria-hidden="true">' + art + "</svg>";
  }

  // An icon on a square of the paper, in the colors it is drawn in.
  function iconCard(kind, size, card) {
    return '<span class="icon-card" style="width:' + card + "px;height:" + card + "px;background:" +
           (style.sheet || "#ffffff") + '">' + iconTile(kind, size) + "</span>";
  }

  function iconSet(key) { return ICON_SETS.filter(function (s) { return s[0] === key; })[0] || null; }
  function iconTotal() { return Object.keys(ICON_SET_OF).length; }

  // Across tiles laid out in rows (and in more than one grid, one under the
  // other), the way the eye goes: left and right along them, up and down to
  // the nearest in the row above or below.  -1 where there is none.
  function iconStep(cells, at, key) {
    if (key === "ArrowRight") { return at + 1 < cells.length ? at + 1 : at; }
    if (key === "ArrowLeft") {
      var me = cells[at].getBoundingClientRect(), before = cells[at - 1];
      return before && before.getBoundingClientRect().top > me.top - 4 ? at - 1 : -1;
    }
    var a = cells[at].getBoundingClientRect(), mid = (a.left + a.right) / 2;
    var best = -1, gap = Infinity, off = Infinity;
    cells.forEach(function (c, i) {
      var b = c.getBoundingClientRect();
      var dy = key === "ArrowDown" ? b.top - a.top : a.top - b.top;
      if (dy < 4) { return; }
      var dx = Math.abs((b.left + b.right) / 2 - mid);
      if (dy < gap - 4 || (Math.abs(dy - gap) <= 4 && dx < off)) { gap = dy; off = dx; best = i; }
    });
    return best;
  }

  // One icon, as a tile: on its square of paper, its name under it -- two
  // lines of it, not cut off at one.  Pressed, it is added; carried, it
  // lands where it is let go; pointed at, it says what it is (`shown`).
  function iconTileButton(kind, pick, shown, card) {
    var cell = document.createElement("button");
    cell.type = "button";
    cell.className = "icon-cell";
    cell.dataset.kind = kind;
    cell.title = kindName(kind);
    cell.setAttribute("aria-label", kindName(kind));
    cell.innerHTML = iconCard(kind, card - 12, card) + '<span class="icon-name"></span>';
    cell.lastChild.textContent = kindName(kind);
    lendRow(cell, kind);                 // carried onto the paper (20-menu.js)
    var lent = cell.ondragstart;
    cell.ondragstart = function (ev) { iconUsed(kind); lent.call(cell, ev); };
    cell.onclick = function (ev) {
      ev.stopPropagation();
      closeMenu();
      iconUsed(kind);
      pick(kind);
    };
    if (shown) {
      cell.addEventListener("pointerenter", function () { shown(kind); });
      cell.addEventListener("focus", function () { shown(kind); });
    }
    return cell;
  }

  // The tiles answer the arrows themselves (iconStep); what they do not
  // take -- Escape, and Left off the first of a row -- goes on to the menu.
  function iconGridKeys(holder, cellsOf, out) {
    holder.addEventListener("keydown", function (ev) {
      var cells = cellsOf(), at = cells.indexOf(document.activeElement);
      if (at < 0 || !/^Arrow/.test(ev.key)) { return; }
      var to = iconStep(cells, at, ev.key);
      if (to >= 0) {
        cells[to].focus({ preventScroll: true });
        cells[to].scrollIntoView({ block: "nearest" });
      } else if (!out || !out(ev.key)) { return; }
      ev.preventDefault();
      ev.stopPropagation();
    });
  }

  // ---- the library -------------------------------------------------------------
  // A window of its own off the panel: the sets down the side, each with
  // its face and how many it holds; a box to search them all; the icons,
  // under a heading for each set; and along the foot, the one pointed at,
  // by name, with how to put it on the paper.  Narrow, the sets run across
  // the top instead.  `pick` is what a pressed icon does.
  function iconLibrary(pick) {
    var at = iconLibAt;
    if (at.set === "recent" && !iconRecent().length) { at.set = ""; }
    if (at.set && at.set !== "recent" && !iconSet(at.set)) { at.set = ""; }
    var box = document.createElement("div");
    box.className = "icon-lib-in";
    var side = document.createElement("div");
    side.className = "icon-side";
    side.setAttribute("role", "group");
    side.setAttribute("aria-label", TXT.ic_sets);
    var main = document.createElement("div");
    main.className = "icon-main";
    var top = document.createElement("div");
    top.className = "icon-top";
    var search = document.createElement("label");
    search.className = "icon-search";
    search.innerHTML = iconUi("find");
    var find = document.createElement("input");
    find.type = "search";
    find.className = "field icon-find";
    find.placeholder = say("ic_find_n", { n: iconTotal() });
    find.setAttribute("aria-label", TXT.ic_find);
    find.value = at.find;
    var clear = document.createElement("button");
    clear.type = "button";
    clear.className = "icon-clear";
    clear.title = TXT.ic_clear;
    clear.setAttribute("aria-label", TXT.ic_clear);
    clear.innerHTML = iconUi("clear");
    search.appendChild(find);
    search.appendChild(clear);
    top.appendChild(search);
    var scroll = document.createElement("div");
    scroll.className = "icon-scroll";
    var foot = document.createElement("div");
    foot.className = "icon-foot";
    foot.setAttribute("aria-live", "polite");
    main.appendChild(top);
    main.appendChild(scroll);
    main.appendChild(foot);
    box.appendChild(side);
    box.appendChild(main);

    // the sets, down the side
    function cat(key, name, lead, count) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "icon-cat";
      b.dataset.set = key;
      b.innerHTML = '<span class="icon-cat-lead">' + lead + '</span><span class="icon-cat-name"></span>' +
                    '<span class="icon-count"></span>';
      b.children[1].textContent = name;
      b.children[2].textContent = count;
      b.title = name;
      b.onclick = function (ev) { ev.stopPropagation(); choose(key); };
      side.appendChild(b);
    }
    cat("", TXT.ic_all_icons, iconUi("all"), iconTotal());
    if (iconRecent().length) { cat("recent", TXT.ic_recent, iconUi("recent"), iconRecent().length); }
    var rule = document.createElement("hr");
    rule.className = "icon-cat-rule";
    side.appendChild(rule);
    ICON_SETS.forEach(function (set) {
      cat(set[0], TXT[set[0]] || set[0], iconGlyph(ICON_SET_FACE[set[0]] || set[1][0], 18), set[1].length);
    });
    function lit() {
      all(".icon-cat", side).forEach(function (b) {
        var on = b.dataset.set === at.set;
        b.classList.toggle("on", on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      });
    }
    function choose(key) {
      at.set = key;
      lit();
      var on = el('.icon-cat[data-set="' + key + '"]', side);
      if (on) { on.scrollIntoView({ block: "nearest", inline: "nearest" }); }
      fill(true);
    }

    // what is shown: a set, or every set under its heading -- what was used
    // last first -- each cut down to what the search asks for
    function groups() {
      var words = find.value.toLowerCase().split(/\s+/).filter(Boolean), out = [], seen = {};
      function add(key, kinds) {
        if (words.length) {
          kinds = kinds.filter(function (k) { return !seen[k] && iconFits(k, words); });
          kinds.forEach(function (k) { seen[k] = true; });
        }
        if (kinds.length) { out.push({ key: key, kinds: kinds }); }
      }
      if (at.set === "recent") { add("recent", iconRecent()); }
      else if (at.set) { add(at.set, iconSet(at.set)[1]); }
      else {
        if (!words.length && iconRecent().length) { add("recent", iconRecent().slice(0, 10)); }
        ICON_SETS.forEach(function (set) { add(set[0], set[1]); });
      }
      return { words: words, groups: out };
    }
    function titled(key) { return key === "recent" ? TXT.ic_recent : TXT[key] || key; }
    function face(key) { return key === "recent" ? iconUi("recent") : iconGlyph(ICON_SET_FACE[key] || "", 16); }
    var count = 0;
    function fill(swap) {
      var got = groups();
      scroll.innerHTML = "";
      scroll.scrollTop = 0;
      count = 0;
      got.groups.forEach(function (g) {
        var sec = document.createElement("section");
        sec.className = "icon-sec";
        var head = document.createElement(at.set ? "div" : "button");
        head.className = "icon-sec-head";
        head.innerHTML = '<span class="icon-sec-face">' + face(g.key) + '</span><span class="icon-sec-name"></span>' +
                         '<span class="icon-count"></span>' + (at.set ? "" : iconUi("more", "iu icon-sec-more"));
        head.children[1].textContent = titled(g.key);
        head.children[2].textContent = g.kinds.length;
        if (!at.set) {
          head.type = "button";
          head.title = say("ic_show_set", { set: titled(g.key) });
          head.onclick = function (ev) { ev.stopPropagation(); choose(g.key); };
        }
        sec.appendChild(head);
        var grid = document.createElement("div");
        grid.className = "icon-grid";
        g.kinds.forEach(function (kind) { grid.appendChild(iconTileButton(kind, pick, tell, 48)); });
        sec.appendChild(grid);
        scroll.appendChild(sec);
        count += g.kinds.length;
      });
      if (!got.groups.length) {
        var none = document.createElement("div");
        none.className = "icon-none";
        none.innerHTML = iconUi("find", "iu icon-none-art") + '<p></p>';
        none.lastChild.textContent = TXT.ic_none;
        var again = document.createElement("button");
        again.type = "button";
        again.className = "btn small";
        again.textContent = TXT.ic_clear;
        again.onclick = function (ev) { ev.stopPropagation(); find.value = ""; at.find = ""; fill(true); find.focus(); };
        none.appendChild(again);
        scroll.appendChild(none);
      }
      clear.hidden = !find.value;
      if (swap && !(typeof STILL !== "undefined" && STILL)) {
        scroll.classList.remove("swap");
        void scroll.offsetWidth;
        scroll.classList.add("swap");
      }
      tell(null);
    }
    // along the foot: the icon pointed at, or how many there are
    function tell(kind) {
      foot.innerHTML = "";
      var what = document.createElement("span");
      what.className = "icon-foot-what";
      if (kind) {
        what.innerHTML = iconCard(kind, 24, 32) + '<span class="icon-foot-name"><b></b><small></small></span>';
        what.querySelector("b").textContent = kindName(kind);
        what.querySelector("small").textContent = TXT[ICON_SET_OF[kind]] || "";
      } else {
        what.textContent = find.value ? say("ic_found", { n: count }) : say("ic_count", { n: count });
      }
      foot.appendChild(what);
      var hint = document.createElement("span");
      hint.className = "icon-foot-hint";
      hint.textContent = COARSE ? TXT.ic_hint_touch : TXT.ic_hint;
      foot.appendChild(hint);
    }
    scroll.addEventListener("pointerleave", function () { tell(null); });

    // a search is of every icon, whichever set was open
    find.addEventListener("input", function () {
      at.find = find.value;
      if (find.value.trim() && at.set) { at.set = ""; lit(); }
      fill(false);
    });
    clear.onclick = function (ev) {
      ev.preventDefault(); ev.stopPropagation();
      find.value = ""; at.find = "";
      fill(true);
      find.focus();
    };
    // In the box the keys are the typing's -- but for Escape, and down into
    // the tiles; Enter adds the first that matches.
    find.addEventListener("keydown", function (ev) {
      var first = el(".icon-cell", scroll);
      if (ev.key === "ArrowDown" && first) { first.focus(); ev.preventDefault(); }
      else if (ev.key === "Enter" && first) { first.click(); ev.preventDefault(); }
      if (ev.key !== "Escape") { ev.stopPropagation(); }
    });
    iconGridKeys(scroll, function () { return all(".icon-cell", scroll); }, function (key) {
      if (key === "ArrowUp") { find.focus(); return true; }
      if (key === "ArrowLeft") {
        var on = el(".icon-cat.on", side) || el(".icon-cat", side);
        if (on) { on.focus(); return true; }
      }
      return false;
    });
    // down and up the sets, and right into their icons
    side.addEventListener("keydown", function (ev) {
      var cats = all(".icon-cat", side), i = cats.indexOf(document.activeElement);
      if (i < 0) { return; }
      var to = { ArrowDown: i + 1, ArrowUp: i - 1, Home: 0, End: cats.length - 1 }[ev.key];
      if (to !== undefined) { (cats[(to + cats.length) % cats.length]).focus(); }
      else if (ev.key === "ArrowRight") {
        var first = el(".icon-cell", scroll);
        if (first) { first.focus(); }
      } else { return; }
      ev.preventDefault();
      ev.stopPropagation();
    });
    lit();
    fill(false);
    box.focusFind = function () { find.focus({ preventScroll: true }); find.select(); };
    return box;
  }

  // Opened off the panel's button: beside the panel, over the paper, where
  // there is room -- or under the button, where there is not.
  function openIconLibrary(anchor, pick, set) {
    if (set !== undefined) { iconLibAt.set = set; }
    var lib = iconLibrary(pick);
    var r = anchor ? anchor.getBoundingClientRect() : null, panel = el("#panel");
    var p = panel && panel.offsetParent !== null ? panel.getBoundingClientRect() : null;
    var x, y;
    if (r && p && innerWidth - p.right > 440) { x = p.right + 8; y = Math.max(60, r.top - 140); }
    else if (r) { x = r.left; y = r.bottom + 4; }
    else {                                // from a menu now gone: over the middle of the paper
      var s = el("#stage").getBoundingClientRect();
      x = s.left + s.width / 2 - 330; y = s.top + 40;
    }
    openMenu(x, y, [{ bit: lib }], "icon-lib");
    if (anchor) { anchor.setAttribute("aria-expanded", "true"); }
    if (!COARSE) { lib.focusFind(); }    // a keyboard would pop up over it on a phone
  }

  // ---- in a menu: the sets, and beside each, its icons ------------------------
  // The paper's own menu (20-menu.js) has a row, Icons, that opens a menu of
  // its own: a box to search, what was used last, and the sets, each with
  // its face and its count -- and each of those opens its icons beside it,
  // in a small grid of tiles.  The last row opens the whole library.
  function iconFly(title, kinds, pick) {
    var fly = document.createElement("div");
    fly.className = "icon-fly";
    var grid = document.createElement("div");
    grid.className = "icon-grid";
    kinds.forEach(function (kind) { grid.appendChild(iconTileButton(kind, pick, null, 44)); });
    fly.appendChild(grid);
    var hint = document.createElement("p");
    hint.className = "icon-fly-hint";
    hint.textContent = COARSE ? TXT.ic_hint_touch : TXT.ic_hint;
    fly.appendChild(hint);
    iconGridKeys(grid, function () { return all(".icon-cell", grid); }, null);
    return [{ head: title }, { bit: fly }];
  }

  function iconSearchRow(pick) {
    var wrap = document.createElement("label");
    wrap.className = "icon-search icon-menu-search";
    wrap.innerHTML = iconUi("find");
    var find = document.createElement("input");
    find.type = "search";
    find.className = "field icon-find";
    find.placeholder = say("ic_find_n", { n: iconTotal() });
    find.setAttribute("aria-label", TXT.ic_find);
    wrap.appendChild(find);
    var waiting = 0;
    function found() {
      var menu = wrap.closest(".menu");
      if (!menu) { return null; }
      shutSubMenus(+(menu.dataset.level || 0) + 1);
      var words = find.value.toLowerCase().split(/\s+/).filter(Boolean);
      if (!words.length) { return null; }
      var hits = [], seen = {};
      ICON_SETS.forEach(function (set) {
        set[1].forEach(function (k) { if (!seen[k] && iconFits(k, words)) { seen[k] = true; hits.push(k); } });
      });
      return openSubMenu(wrap, hits.length ? iconFly(say("ic_found", { n: hits.length }), hits.slice(0, 96), pick)
                                          : [{ head: TXT.ic_none }]);
    }
    find.addEventListener("input", function () {
      clearTimeout(waiting);
      waiting = setTimeout(found, 120);
    });
    find.addEventListener("keydown", function (ev) {
      if (ev.key === "ArrowDown" || ev.key === "Enter") {
        clearTimeout(waiting);
        var sub = all(".menu.sub:not(.out)").filter(function (m) { return m.opener === wrap; })[0] || found();
        var first = sub && el(".icon-cell", sub);
        if (first) { if (ev.key === "Enter") { first.click(); } else { first.focus(); } }
        else if (ev.key === "ArrowDown") {           // nothing typed: on down the rows
          var menu = wrap.closest(".menu"), next = menu && el("button", menu);
          if (next) { next.focus(); }
        }
        ev.preventDefault();
      }
      if (ev.key !== "Escape" && !(ev.key === "ArrowLeft" && !find.value)) { ev.stopPropagation(); }
    });
    // A letter typed anywhere in this menu is a search for it.
    setTimeout(function () {
      var menu = wrap.closest(".menu");
      if (!menu || menu.iconTyping) { return; }
      menu.iconTyping = true;
      menu.addEventListener("keydown", function (ev) {
        if (ev.target === find || ev.key.length !== 1 || ev.ctrlKey || ev.metaKey || ev.altKey || ev.key === " ") { return; }
        find.focus();
      }, true);
    }, 0);
    return wrap;
  }

  function iconMenuItems(pick) {
    var items = [{ bit: iconSearchRow(pick) }], recent = iconRecent();
    if (recent.length) {
      items.push({ mark: iconUi("recent", "mi"), name: TXT.ic_recent, keys: String(recent.length),
                   sub: function () { return iconFly(TXT.ic_recent, iconRecent(), pick); } });
    }
    items.push("-");
    ICON_SETS.forEach(function (set) {
      items.push({ mark: '<span class="mi-face">' + iconGlyph(ICON_SET_FACE[set[0]] || set[1][0], 16) + "</span>",
                   name: TXT[set[0]] || set[0], keys: String(set[1].length),
                   sub: function () { return iconFly(TXT[set[0]] || set[0], set[1], pick); } });
    });
    items.push("-");
    items.push({ mark: iconUi("browse", "mi"), name: TXT.ic_browse,
                 go: function () { openIconLibrary(null, pick); } });
    return items;
  }

  // The row itself, in the menus that add a shape: Icons, and how many.
  function iconRow(pick) {
    return { mark: iconUi("all", "mi"), name: TXT.ic_open, keys: String(iconTotal()),
             sub: function () { return iconMenuItems(pick); } };
  }

  // ---- under Add a shape ------------------------------------------------------
  // The button that opens the library -- the whole width of the panel, its
  // count beside its name -- and under it the icons used last, each on its
  // square of paper, one press (or a carry) away.
  function iconShelf() {
    var box = el("#adders");
    if (!box) { return; }
    var shelf = document.createElement("div");
    shelf.className = "icon-shelf";
    var open = document.createElement("button");
    open.type = "button";
    open.className = "btn icon-lib-btn";
    open.setAttribute("aria-haspopup", "dialog");
    open.setAttribute("aria-expanded", "false");
    open.innerHTML = '<span class="ilb-lead">' + iconUi("all") + '</span><span class="ilb-name" data-w="ic_open"></span>' +
                     '<span class="icon-count"></span>' + iconUi("more", "iu ilb-more");
    el(".ilb-name", open).textContent = TXT.ic_open;
    el(".icon-count", open).textContent = iconTotal();
    open.title = TXT.ic_open_tip;
    open.onclick = function (ev) {
      ev.stopPropagation();              // or the click that opened it shuts it
      if (open.getAttribute("aria-expanded") === "true") { closeMenu(); return; }
      openIconLibrary(open, function (kind) { addNode(kind); drawIconShelf(); });
    };
    shelf.appendChild(open);
    var recent = document.createElement("div");
    recent.className = "icon-recent";
    recent.setAttribute("role", "group");
    recent.setAttribute("aria-label", TXT.ic_recent);
    recent.innerHTML = '<span class="icon-recent-head"></span><div class="icon-recent-row"></div>';
    recent.firstChild.textContent = TXT.ic_recent;
    shelf.appendChild(recent);
    box.appendChild(shelf);
    drawIconShelf();
  }

  function drawIconShelf() {
    var recent = el("#adders .icon-recent"), row = recent && el(".icon-recent-row", recent);
    if (!row) { return; }
    row.innerHTML = "";
    var kinds = iconRecent().slice(0, 6);
    recent.hidden = !kinds.length;
    kinds.forEach(function (kind) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "icon-quick";
      b.title = kindName(kind);
      b.setAttribute("aria-label", kindName(kind));
      b.innerHTML = iconCard(kind, 22, 30);
      b.onclick = function () { iconUsed(kind); addNode(kind); };
      lendAdder(b, kind);                // carried, it lands where it is let go
      row.appendChild(b);
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
