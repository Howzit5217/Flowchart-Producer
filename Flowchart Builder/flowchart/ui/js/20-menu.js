// ---------------------------------------------------------------------------
//  20-menu.js -- the menu on the right mouse button
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ----------------------------------------------------- the right button --
  // Everything you can do to a shape or an arrow, where the thing itself is,
  // instead of over in the panel.
  // Whatever opened a menu is no longer holding it open.  Its own function
  // because a menu is shut from four different places -- here, the click
  // outside, the Escape key, and the motion layer, which takes this one over
  // to fade the menu out rather than snatch it away -- and only one of those
  // is the button that opened it.
  function letGoOfMenus() {
    all('[aria-expanded="true"]').forEach(function (b) {
      if (b.id === "more" || b.id === "hand-info" || b.classList.contains("set-btn") ||
          b.closest(".menu")) {          // and a row whose menu went with it
        b.setAttribute("aria-expanded", "false");
      }
    });
    shutDropList();                      // and a dropdown's list, at once
  }

  function closeMenu() {
    all(".menu").forEach(function (m) { m.remove(); });
    letGoOfMenus();
  }
  // The colors opened from a menu row sit beside the menu rather than in
  // it, and choosing one is not a press somewhere else.
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest || !ev.target.closest(".menu, .colorpop")) { closeMenu(); }
  });
  window.addEventListener("keydown", function (ev) {
    if (ev.key === "Escape") { closeMenu(); }
  });

  // `kind` is a class of its own for a menu that is not the usual list --
  // the sizes, which are many and short, and scroll rather than run off
  // the screen.  It is on before the menu is measured, so the menu is
  // placed at the size it will really be.
  function openMenu(x, y, items, kind) {
    closeMenu();
    var menu = document.createElement("div");
    menu.className = "menu" + (kind ? " " + kind : "");
    menu.dataset.level = "0";
    menuRows(menu, items);
    document.body.appendChild(menu);
    var room = menu.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(x, innerWidth - room.width - 8)) + "px";
    menu.style.top = Math.max(8, Math.min(y, innerHeight - room.height - 8)) + "px";
    // The keys are the menu's while it is open (menuKeys) -- the arrows go
    // up and down it rather than nudging the shape under it -- unless words
    // are being typed somewhere, which keep them.
    if (!typingNow()) {
      menu.tabIndex = -1;
      menu.focus({ preventScroll: true });
    }
  }

  // The small drawings in front of a row: the bar over the paper's
  // (BAR_ICONS, 11-hand-many.js) where the row does what that button does,
  // so the two say it the same way, and these for the rest.
  var MENU_ICONS = {
    next: '<rect x="5.5" y="2.5" width="9" height="5.5" rx="1.2"/><path d="M10 8v3"/>' +
          '<circle cx="10" cy="14.5" r="3.3"/><path d="M10 13v3M8.5 14.5h3"/>',
    into: '<path d="M10 2.5v3.5M10 14v3.5"/><rect x="5" y="6" width="10" height="8" rx="1.5"/>',
    colors: '<path d="M10 3a7 7 0 1 0 0 14c1.1 0 1.7-.8 1.7-1.7 0-.9-.8-1.3-.8-2.2 0-.9.7-1.5 1.6-1.5' +
            'H14a3 3 0 0 0 3-3C17 5.7 13.9 3 10 3z"/><circle cx="6.6" cy="9.4" r=".8"/>' +
            '<circle cx="8.6" cy="6.3" r=".8"/><circle cx="12.3" cy="6.3" r=".8"/>',
    words: '<path d="M4.5 15.5 9 4.5h2l4.5 11M6.6 11.5h6.8"/>',
    plain: '<circle cx="10" cy="10" r="6.5"/><path d="M5.5 14.5l9-9"/>',
    lineup: '<path d="M3.5 3v14"/><rect x="6" y="5" width="10.5" height="3.6" rx="1"/>' +
            '<rect x="6" y="11.4" width="6.5" height="3.6" rx="1"/>',
    dash: '<path d="M2.8 10h3M8.5 10h3M14.2 10h3"/>',
    solid: '<path d="M2.8 10h14.4"/>',
    pin: '<path d="M10 17.5V12.4M6 12.4h8l-1.6-3.1V4.5H7.6v4.8z"/>',
    shapes: '<rect x="3" y="3" width="6" height="6" rx="1.2"/><circle cx="14" cy="6" r="3"/>' +
            '<path d="M6 11.5l3.2 5.5H2.8zM14 11l3 3-3 3-3-3z"/>',
    fit: '<path d="M3.5 7.5v-4h4M12.5 3.5h4v4M16.5 12.5v4h-4M7.5 16.5h-4v-4"/>',
    format: '<path d="M3.5 6H6M10 6h6.5M3.5 14h7M14.5 14h2"/><circle cx="8" cy="6" r="2"/>' +
            '<circle cx="12.5" cy="14" r="2"/>'
  };
  function menuIcon(name) {
    var art = MENU_ICONS[name] || BAR_ICONS[name] || "";
    return '<svg class="mi" viewBox="0 0 20 20" aria-hidden="true">' + art + "</svg>";
  }
  // The keys that do what a row does, as the list of keys writes them:
  // Ctrl+C, and ⌘+C where there is a Command key (keyName, 25-keys.js).
  function keyHint(keys) {
    return keys.map(function (key) { return keyName(key); }).join("+");
  }
  var MORE_ART = '<svg class="mi-more" viewBox="0 0 10 10" aria-hidden="true">' +
                 '<path d="M3.8 2.2 6.6 5 3.8 7.8"/></svg>';

  // A letter of each row's name to press for it, the way Word's menus mark
  // theirs: the first letter of a word that no row above has taken, or
  // failing that any letter it has.  Where in the name it is, or -1.
  function accessLetter(name, used) {
    function free(i) {
      var c = name.charAt(i).toLowerCase();
      return c !== c.toUpperCase() && !used[c];     // a letter, and not taken
    }
    var at = -1, i;
    for (i = 0; i < name.length && at < 0; i++) {
      if ((i === 0 || name.charAt(i - 1) === " ") && free(i)) { at = i; }
    }
    for (i = 0; i < name.length && at < 0; i++) { if (free(i)) { at = i; } }
    if (at >= 0) { used[name.charAt(at).toLowerCase()] = true; }
    return at;
  }

  // The rows themselves, for a menu or for one opened off a row of it.
  // A row is { name, go } and may also have: `icon` (a MENU_ICONS name),
  // `mark` (a shape in miniature, or a tick), `swatch` (a color), `keys`
  // (the keys that do the same), `sub` (the rows of a menu of its own,
  // opened beside it, as a list or a function that makes one), `drag`
  // (a shape the row can be carried onto the paper as), `danger` (it
  // throws something away), `off` (nothing for it to do just now) and
  // `keepOpen`.  In a menu laid out as Word's (.word) every row has a
  // letter to press for it, underlined.
  function menuRows(menu, items) {
    menu.setAttribute("role", "menu");
    var used = {}, word = menu.classList.contains("word");
    // Rows with a shape in front want more room there than an icon does;
    // every row keeps the same, so the words all start in one place.
    menu.classList.toggle("wide-lead", items.some(function (item) {
      return item && item.mark && item.mark.indexOf("legendkey") >= 0;
    }));
    var leads = items.some(function (item) {
      return item && (item.icon || item.mark || item.swatch);
    });
    items.forEach(function (item) {
      if (item === "-") {
        menu.appendChild(document.createElement("hr"));
        return;
      }
      // A menu that holds settings rather than actions wants saying what
      // the settings under it are for.
      if (item.head) {
        var said = document.createElement("h4");
        said.textContent = item.head;
        menu.appendChild(said);
        return;
      }
      // Something that is to be read rather than pressed -- a few words, a
      // list of keys -- put in as it comes (the i by Add a shape).
      if (item.bit) {
        menu.appendChild(item.bit);
        return;
      }
      // A row of small buttons side by side -- B, I, U and the like -- that
      // leave the menu open, so that bold and bigger are two presses in one
      // menu rather than a menu each.  One that is a switch lights while on.
      if (item.tools) {
        var strip = document.createElement("div");
        strip.className = "menu-tools";
        item.tools.forEach(function (tool) {
          var b = document.createElement("button");
          b.type = "button";
          b.className = "tog" + (tool.on ? " on" : "");
          if (tool.art) { b.innerHTML = tool.art; }   // a drawing, where a letter will not do
          else { b.textContent = tool.mark; }
          b.title = tool.name;
          b.setAttribute("aria-label", tool.name);
          if (tool.on !== undefined) {
            b.setAttribute("aria-pressed", tool.on ? "true" : "false");
          }
          b.onclick = function (ev) {
            ev.stopPropagation();
            var now = tool.go();
            if (tool.on !== undefined) {
              b.classList.toggle("on", !!now);
              b.setAttribute("aria-pressed", now ? "true" : "false");
            }
          };
          strip.appendChild(b);
        });
        menu.appendChild(strip);
        return;
      }
      var row = document.createElement("button");
      row.type = "button";
      row.setAttribute("role", "menuitem");
      row.style.position = "relative";
      var lead = item.swatch
               ? '<span class="dot" style="background:' + item.swatch + '"></span>'
               : item.icon ? menuIcon(item.icon) : (item.mark || "");
      row.innerHTML = (leads ? '<span class="mi-lead">' + lead + "</span>" : "") +
                      '<span class="mi-name"></span>' +
                      (item.keys ? '<span class="mi-keys"></span>' : "") +
                      (item.sub ? MORE_ART : "");
      var named = row.querySelector(".mi-name");
      var letter = word ? accessLetter(item.name, used) : -1;
      if (letter < 0) { named.textContent = item.name; }
      else {
        var mark = document.createElement("u");
        mark.textContent = item.name.charAt(letter);
        named.appendChild(document.createTextNode(item.name.slice(0, letter)));
        named.appendChild(mark);
        named.appendChild(document.createTextNode(item.name.slice(letter + 1)));
        row.dataset.key = mark.textContent.toLowerCase();
      }
      if (item.keys) { row.querySelector(".mi-keys").textContent = item.keys; }
      if (item.danger) { row.classList.add("danger"); }
      if (item.off) { row.disabled = true; }
      if (item.sub) {
        row.setAttribute("aria-haspopup", "menu");
        row.setAttribute("aria-expanded", "false");
        row.openSub = function () {
          return openSubMenu(row, typeof item.sub === "function" ? item.sub() : item.sub);
        };
        row.onpointerdown = function (ev) { row.pressedBy = ev.pointerType; row.pressedAt = Date.now(); };
        row.onclick = function (ev) {
          ev.stopPropagation();
          clearTimeout(subTimer);
          var open = subOf(row);
          // A finger pressing it again folds it away; a mouse that was
          // already there when it opened is only pressing what it hovers.
          if (open && ev.isTrusted && row.pressedBy !== "mouse" &&
              open.openedAt < row.pressedAt) {
            shutSubMenus(+open.dataset.level);
            return;
          }
          var sub = open || row.openSub();
          // pressed from the keys (a click from the browser with no
          // pointer behind it): on into it
          if (sub && ev.isTrusted && !ev.detail) { firstRowOf(sub); }
        };
        menu.appendChild(row);
        return;
      }
      if (item.drag) { lendRow(row, item.drag); }
      row.onclick = function (ev) {
        ev.stopPropagation();
        if (!item.keepOpen) { closeMenu(); }
        item.go(row);
      };
      menu.appendChild(row);
    });
    if (!menu.dataset.keys) {
      menu.dataset.keys = "on";
      menu.addEventListener("keydown", menuKeys);
      menu.addEventListener("pointerover", function (ev) {
        if (ev.pointerType !== "mouse") { return; }   // a finger is 20-slide.js's
        var row = ev.target.closest && ev.target.closest("button");
        if (!row || row.closest(".menu") !== menu) { return; }
        if (ev.relatedTarget && row.contains(ev.relatedTarget)) { return; }   // still on it
        menuRowOver(row);
      });
    }
  }

  // ---------------------------------------------- a menu beside a row --
  // A row with more behind it -- the colors, the words, the shapes of a
  // kind -- opens a menu of its own beside the one it is in, its first row
  // level with the row it came from, on whichever side there is room.
  // Where there is room on neither, as on a phone, it opens over the
  // menu, stepped in and below the row, so the row can still be read.
  var subTimer = 0;

  function subOf(row) {
    return all(".menu.sub:not(.out)").filter(function (sub) {
      return sub.opener === row;
    })[0] || null;
  }

  // `how` may say `below` -- dropped down under a button of a bar rather
  // than beside a row -- and give it a `kind` of its own.  One opened off a
  // menu laid out as Word's is laid out as Word's too.
  function openSubMenu(row, items, how) {
    var parent = row.closest(".menu");
    if (!parent || !items || !items.length) { return null; }
    how = how || {};
    var level = +(parent.dataset.level || 0) + 1;
    shutSubMenus(level);
    var sub = document.createElement("div");
    sub.className = "menu sub" + (parent.classList.contains("word") ? " word" : "") +
                    (how.kind ? " " + how.kind : "");
    sub.dataset.level = String(level);
    sub.opener = row;
    sub.openedAt = Date.now();
    menuRows(sub, items);
    document.body.appendChild(sub);
    row.setAttribute("aria-expanded", "true");
    placeSubMenu(sub, row, parent, how.below);
    return sub;
  }

  function placeSubMenu(sub, row, parent, below) {
    var p = parent.getBoundingClientRect(), r = row.getBoundingClientRect();
    var w = sub.offsetWidth, h = sub.offsetHeight;
    if (below) {                          // under the button, or over it
      var down = r.bottom + 4 + h <= innerHeight - 8;
      sub.dataset.side = down ? "below" : "above";
      sub.style.left = Math.max(8, Math.min(r.left, innerWidth - w - 8)) + "px";
      sub.style.top = Math.max(8, down ? r.bottom + 4 : r.top - 4 - h) + "px";
      return;
    }
    // the menu's own padding and border, so the rows line up
    var inset = parseFloat(getComputedStyle(sub).paddingTop) + 1;
    var y = r.top - inset;
    // On the way the menu it is opened from went, so that a third menu
    // does not come back over the first.
    var right = p.right - 2 + w <= innerWidth - 8, left = p.left + 2 - w >= 8;
    var side = parent.dataset.side === "left" ? (left ? "left" : right ? "right" : "over")
                                              : (right ? "right" : left ? "left" : "over");
    var x = side === "right" ? p.right - 2 : p.left + 2 - w;
    if (side === "over") {
      x = Math.min(p.left + 24, innerWidth - w - 8);
      y = r.bottom + 2;
    }
    sub.dataset.side = side;
    sub.style.left = Math.max(8, x) + "px";
    sub.style.top = Math.max(8, Math.min(y, innerHeight - h - 8)) + "px";
  }

  // Every menu opened off a row at this depth or deeper, put away, and the
  // rows they were opened from let go of.
  function shutSubMenus(level) {
    all(".menu.sub:not(.out)").forEach(function (sub) {
      if (+sub.dataset.level < level) { return; }
      if (sub.opener) { sub.opener.setAttribute("aria-expanded", "false"); }
      letSubGo(sub);
    });
  }
  function letSubGo(sub) { sub.remove(); }   // 26-motion.js fades it instead

  // The pointer (or a finger drawn along the menu, 20-slide.js) resting on
  // a row: one with more behind it opens that after a moment; any other
  // puts away whatever is open beside this menu, after a longer one, so
  // that crossing a row on the way into the open menu does not shut it.
  function menuRowOver(row) {
    clearTimeout(subTimer);
    var menu = row.closest(".menu");
    if (!menu) { return; }
    var level = +(menu.dataset.level || 0);
    var open = all(".menu.sub:not(.out)").filter(function (sub) {
      return +sub.dataset.level === level + 1;
    })[0];
    if (row.openSub) {
      if (open && open.opener === row) { return; }
      subTimer = setTimeout(function () { row.openSub(); }, open ? 200 : 130);
    } else if (open) {
      subTimer = setTimeout(function () { shutSubMenus(level + 1); }, 280);
    }
  }

  function firstRowOf(menu) {
    var rows = menuKeyRows(menu);
    if (rows[0]) { rows[0].focus({ preventScroll: true }); }
  }
  function menuKeyRows(menu) {
    return all("button", menu).filter(function (b) {
      return !b.disabled && b.offsetParent !== null;
    });
  }

  // The keys a menu answers while it has them: up and down its rows, right
  // into the menu beside a row and left back out of it, and Escape out of
  // one menu at a time.  Kept from the page's own keys, which would
  // otherwise nudge the shape in hand, or take Enter to type into it.
  function menuKeys(ev) {
    var menu = ev.currentTarget, rows = menuKeyRows(menu);
    var at = rows.indexOf(document.activeElement);
    var level = +(menu.dataset.level || 0);
    var row = rows[at];
    var done = true;
    if (ev.key === "ArrowDown") { (rows[at + 1] || rows[0]).focus(); }
    else if (ev.key === "ArrowUp") { (rows[at - 1] || rows[rows.length - 1]).focus(); }
    else if (ev.key === "Home") { rows[0].focus(); }
    else if (ev.key === "End") { rows[rows.length - 1].focus(); }
    else if (ev.key === "ArrowRight" && row && row.openSub) {
      firstRowOf(subOf(row) || row.openSub());
    } else if ((ev.key === "ArrowLeft" || ev.key === "Escape") && level > 0) {
      var from = menu.opener;
      shutSubMenus(level);
      if (from) { from.focus(); }
    } else if (ev.key === "Escape") { closeMenu(); }
    else if (ev.key === "Enter" || ev.key === " ") { done = false; ev.stopPropagation(); }
    else if (ev.key.length === 1 && !ev.ctrlKey && !ev.metaKey && !ev.altKey &&
             menu.classList.contains("word")) {
      // the underlined letter: that row, pressed -- or its menu, gone into
      var hit = rows.filter(function (b) { return b.dataset.key === ev.key.toLowerCase(); })[0];
      if (!hit) { done = false; }
      else if (hit.openSub) { firstRowOf(subOf(hit) || hit.openSub()); }
      else { hit.click(); }
    }
    else { done = false; }
    if (done) { ev.preventDefault(); ev.stopPropagation(); }
  }

  // A row that is a shape can be carried onto the paper, as the shapes in
  // the panel can.  The menus stand aside while it goes, and are put away
  // once it has landed (or not).
  function lendRow(row, kind) {
    row.draggable = true;
    row.ondragstart = function (ev) {
      ev.dataTransfer.setData("text/plain", kind);
      ev.dataTransfer.effectAllowed = "copy";
      dragging_kind = kind;
      setTimeout(function () {             // after the picture of it is taken
        all(".menu").forEach(function (m) { m.classList.add("lending"); });
      }, 0);
    };
    row.ondragend = function () {
      dragging_kind = null;
      closeMenu();
    };
  }

  // Picking a color from the menu.  The row carries a swatch of what it is
  // now; pressing it opens the squares and sliders beside the menu (see
  // colorPop), and the shape takes the color as you move about in them, so
  // you can see what you are choosing before you settle on it.
  function paintRow(name, now, fallback, onPick) {
    var at = now || fallback;
    return { swatch: at, name: name, keepOpen: true,
             go: function (row) {
               row.setAttribute("aria-haspopup", "dialog");
               colorPop(row, at, function (v) {
                 at = v;
                 onPick(v);
                 var dot = row.querySelector(".dot");
                 if (dot) { dot.style.background = v; }
               });
             } };
  }

  // Everything a shape was given of its own -- colors, how its words look,
  // its border -- taken off together, one step to step back from.
  function plainRow(which, mine) {
    return { icon: "plain", name: TXT.c_clear || "No style of its own", go: function () {
        keepUndo();
        var was = typeSign(style);
        Object.keys(mine).forEach(function (key) { delete mine[key]; });
        style.nodes[which] = mine;
        restyled(typeSign(style) !== was);
        drawSelection();
      } };
  }

  // --------------------------------------------- Word's small bar above --
  // Word puts how a thing looks in a small bar of its own over the menu,
  // and what can be done to it in the menu under that.  Using the bar puts
  // the menu away and leaves the bar, so that bold, a size and a color are
  // one visit; a press anywhere else, or Escape, puts the bar away too.
  // It stands above the menu, the left edges lined up -- or, where there is
  // no room above, the menu goes down to make some, or the bar goes under.
  function openMiniBar(list, fill) {
    if (!list) { return null; }
    var bar = document.createElement("div");
    bar.className = "menu mini-bar";
    bar.dataset.level = "0";
    bar.setAttribute("role", "toolbar");
    fill(bar);
    bar.addEventListener("keydown", barKeys);
    bar.addEventListener("click", function () {   // first, before the press itself
      clearTimeout(subTimer);
      all(".menu.word:not(.out)").forEach(function (menu) {
        if (menu.opener) { menu.opener.setAttribute("aria-expanded", "false"); }
        letSubGo(menu);
      });
    }, true);
    document.body.appendChild(bar);
    var m = list.getBoundingClientRect(), w = bar.offsetWidth, h = bar.offsetHeight;
    var y = m.top - h - 6;
    if (y < 8) {
      if (8 + h + 6 + m.height <= innerHeight - 8) {
        list.style.top = (8 + h + 6) + "px";
        y = 8;
      } else {
        y = Math.min(m.bottom + 6, innerHeight - h - 8);
        bar.dataset.side = "below";
      }
    }
    bar.style.left = Math.max(8, Math.min(m.left, innerWidth - w - 8)) + "px";
    bar.style.top = y + "px";
    return bar;
  }

  // Along the bar with the arrow keys, and Escape out of it.
  function barKeys(ev) {
    var keys = menuKeyRows(ev.currentTarget), at = keys.indexOf(document.activeElement);
    if (ev.key === "ArrowRight" || ev.key === "ArrowLeft") {
      var to = keys[(at + (ev.key === "ArrowRight" ? 1 : -1) + keys.length) % keys.length];
      if (to) { to.focus(); }
    } else if (ev.key === "Escape") { closeMenu(); }
    else if (ev.key === "Enter" || ev.key === " ") { ev.stopPropagation(); return; }
    else { return; }
    ev.preventDefault();
    ev.stopPropagation();
  }

  // The bar's drawings, in Word's way of saying them: the letter a bit
  // bigger or smaller, a marker pen, the letter A, a paint pot and an
  // outline -- the last four standing over a bar of the color they are now.
  var TB_ART = {
    grow: '<path d="M2.5 16 7 5h1.2l4.5 11M4.3 12h6.6"/><path d="M13.6 7.6 15.8 5.2 18 7.6"/>',
    shrink: '<path d="M3 16l3.8-8.5h1.1L11.7 16M4.6 13.2h5.4"/><path d="M13.6 5.2 15.8 7.6 18 5.2"/>',
    mark: '<path d="M5.5 12 12 5.5l2.5 2.5L8 14.5H5.5z"/><path d="M10.5 7l2.5 2.5"/>',
    text: '<path d="M5.5 13.5 10 3.5l4.5 10M7.2 10h5.6"/>',
    fill: '<path d="M4.5 8.5 9 4l5 5-4.5 4.5z"/><path d="M4.5 8.5h9.5"/>' +
          '<path d="M16 10.3s1.3 1.6 1.3 2.4a1.3 1.3 0 0 1-2.6 0c0-.8 1.3-2.4 1.3-2.4z"/>',
    line: '<rect x="4" y="3.5" width="12" height="10" rx="1.5"/>'
  };
  var TB_LOOKS = { bold: '<b class="tb-glyph">B</b>', italic: '<i class="tb-glyph">I</i>',
                   under: '<u class="tb-glyph">U</u>', strike: '<s class="tb-glyph">ab</s>' };
  var TB_DROP = '<svg class="tb-drop" viewBox="0 0 10 10" aria-hidden="true">' +
                '<path d="M2.5 3.8 5 6.3l2.5-2.5"/></svg>';

  // One shape's bar: its size, a step bigger and smaller; bold, italic,
  // underline and struck through; and its highlighter, words, fill and
  // border colors -- in that order, as Word has them.
  function shapeBar(bar, node, which, mine) {
    var k = kindColors(node.kind), first = true;
    function group() {
      var g = document.createElement("div");
      g.className = "tb-group";
      bar.appendChild(g);
      return g;
    }
    function button(into, cls, art, name) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = cls;
      b.innerHTML = art;
      b.title = name;
      b.setAttribute("aria-label", name);
      into.appendChild(b);
      return b;
    }
    function art(name) {
      return '<svg class="tb-art" viewBox="0 0 20 20" aria-hidden="true">' + TB_ART[name] + "</svg>";
    }
    if (CAN_REFLOW) {
      var sizes = group();
      var size = button(sizes, "tb-size", "", TXT.t_size);
      var up = button(sizes, "tb-btn", art("grow"), TXT.t_bigger + " (Ctrl+Shift+>)");
      var down = button(sizes, "tb-btn", art("shrink"), TXT.t_smaller + " (Ctrl+Shift+<)");
      var showSize = function () {
        var now = shapePt(which);
        size.innerHTML = "<span></span>" + TB_DROP;
        size.firstChild.textContent = ptSaid(now);
        up.disabled = nextSize(now, 1) === now;
        down.disabled = nextSize(now, -1) === now;
      };
      showSize();
      size.setAttribute("aria-haspopup", "menu");
      size.setAttribute("aria-expanded", "false");
      // The sizes, dropped down under the box, the one in use ticked and
      // in the middle of what shows.
      size.onclick = function () {
        if (subOf(size)) { shutSubMenus(1); return; }
        var now = shapePt(which), at = 0;
        var list = openSubMenu(size, TYPE_POINTS.map(function (pt, n) {
          if (pt === now) { at = n; }
          return { name: ptSaid(pt), keepOpen: true,
                   mark: pt === now ? tickArt() : '<span class="tick"></span>',
                   go: function () {
                     ownSize(which, pt);
                     drawSelection();
                     shutSubMenus(1);
                     showSize();
                   } };
        }), { below: true, kind: "sizes" });
        var row = list && list.querySelectorAll("button")[at];
        if (row) { list.scrollTop = row.offsetTop - (list.clientHeight - row.offsetHeight) / 2; }
      };
      up.onclick = function () { growWords(which, 1); drawSelection(); showSize(); };
      down.onclick = function () { growWords(which, -1); drawSelection(); showSize(); };
    }
    var looks = group();
    LOOK_KEYS.forEach(function (one) {
      var b = button(looks, "tb-btn", TB_LOOKS[one[0]],
                     TXT[one[1]] + (one[3] ? " (" + one[3] + ")" : ""));
      function show(on) {
        b.classList.toggle("on", !!on);
        b.setAttribute("aria-pressed", on ? "true" : "false");
      }
      show(lookOn(which, one[0]));
      b.onclick = function () { show(flipLook(which, one[0])); drawSelection(); };
    });
    // Each color opens the squares and sliders under its button (colorPop),
    // and the shape takes the color as you move about in them; the bar under
    // the drawing goes with it.  One step back undoes the lot.
    var paints = group();
    function colorButton(key, name, fallback) {
      var at = mine[key] || fallback;
      var b = button(paints, "tb-color",
                     '<svg class="tb-art" viewBox="0 0 20 20" aria-hidden="true">' + TB_ART[key] +
                     '<rect class="tb-bar" x="3" y="16" width="14" height="3" rx=".6"/></svg>' +
                     TB_DROP, name);
      var swatch = b.querySelector(".tb-bar");
      swatch.style.fill = at;
      b.setAttribute("aria-haspopup", "dialog");
      b.onclick = function () {
        colorPop(b, at, function (v) {
          if (first) { first = false; keepUndo(); }
          at = v;
          mine[key] = v;
          style.nodes[which] = mine;
          paint();
          keep();
          swatch.style.fill = v;
        });
      };
    }
    // what it wears now, where it has nothing of its own: its kind's, as
    // the panel's swatches show (kindColors, 02-paint.js)
    colorButton("mark", TXT.t_mark, MARKERS[0][0]);
    colorButton("text", TXT.c_words || "Words", k.text || style.words || style.ink || "#000000");
    colorButton("fill", TXT.c_fill || "Fill", k.fill || "#ffffff");
    colorButton("line", TXT.c_line || "Border", k.line || style.ink || "#000000");
  }

  // A row for each shape of a set, which does `go` with it -- and, where
  // `drag`, can be carried onto the paper instead.
  function shapeRows(kinds, go, drag) {
    return kinds.map(function (kind) {
      return { mark: keyMark(kind), name: kindName(kind), drag: drag ? kind : null,
               go: function () { go(kind); } };
    });
  }

  // Every shape there is, behind one row: a menu of the sets they are
  // sorted into (shapeSets, 11-hand-panel.js), and a menu of each set.
  function moreShapesRow(go, drag) {
    return { icon: "shapes", name: TXT.m_more_shapes, sub: function () {
      return shapeSets().map(function (set) {
        return { mark: keyMark(set.kinds[0]), name: TXT[set.name] || set.name,
                 sub: function () { return shapeRows(set.kinds, go, drag); } };
      });
    } };
  }

  // One shape's menu, laid out the way Word lays out the menu for a shape:
  // how it looks in the small bar above (shapeBar), and under it what can
  // be done to it -- the clipboard first, then working on it, then another
  // like it, then its style, ending on Format Shape, which opens the Style
  // side at the card for it the way Word opens its pane.
  function shapeMenu(node, x, y) {
    // One of several taken up: what is done is done to them all.
    if (inMany(node.id)) { groupMenu(x, y); return; }
    picked = node.id;
    chosen = null;
    drawHand();
    drawHandPanel();
    var which = "h" + node.id;
    // the shape's own, kept, so that everything this menu does to it --
    // colors and words alike -- is to one and the same record of how it looks
    var mine = style.nodes[which] = style.nodes[which] || {};
    var here = onPaper({ clientX: x, clientY: y });   // pasted, it goes here
    openMenu(x, y, [
      { icon: "cut", name: TXT.m_clip_cut, go: function () { copyShapes([node.id], true); } },
      { icon: "copy", name: TXT.m_clip_copy, go: function () { copyShapes([node.id]); } },
      { icon: "paste", name: TXT.m_clip_paste, off: !clipNow(),
        go: function () { pasteShapes(here); } },
      { icon: "drop", name: TXT.delete, go: function () {
          keepUndo();
          hand.nodes = hand.nodes.filter(function (n) { return n.id !== node.id; });
          hand.links = hand.links.filter(function (l) {
            return l.from !== node.id && l.to !== node.id;
          });
          picked = null;
          drawHand(); drawHandPanel(); showReport();
        } },
      "-",
      { icon: "type", name: TXT.m_type, go: function () {
          var g = el('.node[data-i="h' + node.id + '"]', chart);
          if (g) { typeInto(g); }
        } },
      { icon: "join", name: TXT.connect, go: function () {
          joining = true; joinFrom = null; drawHandPanel();
        } },
      // what the + under it does (13-hand-more.js)
      { icon: "next", name: TXT.hp_next,
        sub: function () { return nextRows(node.id, "foot"); } },
      "-",
      // Another like it -- colors and all, which it used to leave behind.
      // (Turning it is the round handle over it now, 13-hand-turn.js.)
      { icon: "another", name: TXT.m_copy, go: function () { duplicateShapes([node.id]); } },
      "-",
      plainRow(which, mine),
      { icon: "format", name: TXT.m_format, go: formatPicked }   // 07-sides.js
    ], "word");
    openMiniBar(el(".menu.word:not(.out)"), function (bar) {
      shapeBar(bar, node, which, mine);
    });
  }

  function arrowMenu(link, x, y) {
    chosen = link.id;
    picked = null;
    drawHand();
    drawHandPanel();
    // The words it can carry, the ones it has ticked.
    function tag(word) {
      var on = (link.label || "") === word;
      return { mark: on ? tickArt() : '<span class="tick"></span>',
               name: word === "" ? TXT.m_no_word : "“" + word + "”",
               go: function () { keepUndo(); link.label = word; drawHand(); drawHandPanel(); } };
    }
    openMenu(x, y, [
      tag(TXT.yes), tag(TXT.no), tag(""),
      "-",
      { icon: link.dash ? "solid" : "dash", name: link.dash ? TXT.m_solid : TXT.dashed,
        go: function () {
          keepUndo();
          link.dash = !link.dash; drawHand(); drawHandPanel();
        } },
      { icon: "turn", name: TXT.turn_it_round, go: function () {
          keepUndo();
          turnLink(link);
          drawHand(); drawHandPanel(); showReport();
        } },
      { icon: "pin", name: link.pin ? TXT.m_unpin : TXT.m_pin,
        go: function () { pinLink(link, !link.pin); } },
      // a shape between its two ends (13-hand-more.js)
      { icon: "into", name: TXT.hp_into, sub: function () { return intoRows(link.id); } },
      "-",
      { icon: "drop", name: TXT.delete, danger: true, go: function () {
          keepUndo();
          hand.links = hand.links.filter(function (l) { return l !== link; });
          chosen = null;
          drawHand(); drawHandPanel(); showReport();
        } }
    ]);
  }

  function paperMenu(x, y) {
    // The shapes the rules give each kind of step (13-hand-rules.js), a box
    // of words on its own, and every other shape there is behind one row.
    var spots = ruleChoices().concat([{ kind: "text", name: kindName("text") }]);
    // Pasted from here, it goes where the menu was opened.
    var here = onPaper({ clientX: x, clientY: y });
    var after = [];
    if (clipNow()) {
      after.push({ icon: "paste", name: TXT.m_clip_paste, keys: keyHint(["ctrl", "V"]),
                   go: function () { pasteShapes(here); } });
    }
    if (hand.nodes.length) {
      after.push({ icon: "all", name: TXT.m_all, keys: keyHint(["ctrl", "A"]), go: selectAll });
    }
    function add(kind) { addNode(kind); }
    openMenu(x, y, [{ head: TXT.add_shape }].concat(spots.map(function (one) {
      return { mark: keyMark(one.kind), name: one.name, drag: one.kind,
               go: function () { add(one.kind); } };
    }), [moreShapesRow(add, true), "-"], after, after.length ? ["-"] : [], [
      { icon: "fit", name: TXT.m_fit, go: function () { el("#fit").click(); } }
    ]));
  }


  // ------------------------------------------------- asking, before undoing --
  // A press that would throw away something already happening asks first.
  // There is one of these rather than a sheet per question: what is being
  // asked changes, the shape of the asking does not.  It is the smallest
  // sheet on the page and it has exactly two ways out of it, because a
  // question with three answers is not a question anybody reads.
  //
  // The safe answer is the one under the fingers: it takes the focus on
  // opening, Escape gives it, and so does a press on the dimmed page
  // behind.  Going on with it has to be asked for.
  var sureGo = null;

  function areYouSure(head, said, yes, go) {
    var over = el("#sure-over");
    if (!over) { go(); return; }        // nothing to ask with: get on with it
    el("#sure-head").textContent = head;
    el("#sure-said").textContent = said;
    el("#sure-yes").textContent = yes;
    el("#sure-no").textContent = TXT.s_no;
    sureGo = go;
    over.hidden = false;
    el("#sure-no").focus();
  }

  function sureShut(andGo) {
    var over = el("#sure-over");
    if (!over || over.hidden) { return false; }
    over.hidden = true;
    var go = sureGo;
    sureGo = null;
    if (andGo && go) { go(); }
    return true;
  }

  if (el("#sure-over")) {
    el("#sure-yes").onclick = function () { sureShut(true); };
    el("#sure-no").onclick = function () { sureShut(false); };
    el("#sure-over").onclick = function (ev) {
      if (ev.target === el("#sure-over")) { sureShut(false); }
    };
    // Above the screens that fill the page, so a question asked while one
    // of them is up is asked in front of it -- and answered before them,
    // so one Escape does not shut both.
    window.addEventListener("keydown", function (ev) {
      if (ev.key !== "Escape") { return; }
      if (sureShut(false)) { ev.stopImmediatePropagation(); }
    }, true);
  }

  // Building draws a new chart over the one the runner is walking through.
  // Left to itself the run carried on regardless: shapes lighting up on a
  // chart that was no longer there, lines printing into the tape of a
  // program that had been replaced, and Stop still sitting in the panel for
  // a program nobody could point at.  So the run is stopped first -- and
  // stopping a run is somebody's work ending early, which is worth asking
  // about rather than doing quietly.
  function stopThenBuild(go) {
    if (!running) { go(); return; }
    areYouSure(TXT.s_stop_head, TXT.s_stop_said, TXT.s_stop_yes, function () {
      runIt();                          // pressed while running, this stops it
      // Stopping is a request, not an event: the runner notices it on its
      // next step, which may be a moment away if it is sat waiting to be
      // typed into.  Building on top of a run that has not finished
      // unwinding would put the new chart up and then let the old run tidy
      // away over it, so this waits for the runner to really be done.
      var waited = 0;
      (function ready() {
        if (!running || ++waited > 200) { go(); return; }
        setTimeout(ready, 20);
      })();
    });
  }

  // ---------------------------------------------------- the dropdown lists --
  // The shut box of a dropdown has been drawn here for a long while
  // (01-base.css), but the list that fell out of it was still the
  // machine's: a system list in its own font, its own blue and its own
  // square corners, hanging under a box drawn in this page's.  So the list
  // is drawn here as well, out of the same menu the right button opens,
  // and joined on to the box it falls from -- the box's bottom corners go
  // square and the list carries straight on down from them, one piece with
  // rounded corners only at the far end.  With no room below, it opens
  // upward and the join is the other way up.
  //
  // The <select> is still the <select>: whatever reads its value, sets it
  // or listens for it changing goes on exactly as before, and the list is
  // only a way of choosing.  A finger keeps the machine's own list, which
  // on a phone is a sheet the size of the screen, far easier to hit than
  // rows cut to the size of a mouse pointer.
  var dropOpen = null;                   // { box, menu } while a list is down
  var lastPointer = "mouse";

  function shutDropList(back) {
    if (!dropOpen) { return; }
    var box = dropOpen.box, after = dropOpen.after;
    var held = dropOpen.menu.contains(document.activeElement);
    dropOpen.menu.remove();
    cancelAnimationFrame(dropOpen.frame);
    dropOpen = null;
    box.classList.remove("drop-down", "drop-up");
    box.setAttribute("aria-expanded", "false");
    // Whatever was kept waiting for the keys while the list had them -- a
    // question the running program asked -- has them now, if it is still
    // there to be typed into; otherwise the box has them back.
    if (after && (back || held) && after.getClientRects().length && !after.disabled) {
      after.focus();
    } else if (back && box.isConnected) { box.focus({ preventScroll: true }); }
  }

  // Something that wants the keys while a list is down -- the program being
  // run stopping to ask a question, or its next step coming back -- waits
  // for the list to go rather than taking them from under it.  Taken there
  // and then, the list was left open with nothing moving through it, and
  // the arrows meant for it went into the answer instead.
  function focusWhenFree(it) {
    if (dropOpen) { dropOpen.after = it; return; }
    it.focus();
  }

  // Chosen: said to the <select> the way it says it itself, an input and
  // then a change, and only when it is a change -- choosing the one that
  // was already chosen tells nobody anything.
  function dropPick(box, option) {
    shutDropList(true);
    if (option.disabled || box.disabled || option.closest("select") !== box) { return; }
    if (box.selectedIndex === option.index) { return; }
    box.selectedIndex = option.index;
    box.dispatchEvent(new Event("input", { bubbles: true }));
    box.dispatchEvent(new Event("change", { bubbles: true }));
  }

  function openDropList(box) {
    closeMenu();                         // any other menu, and any other list
    var look = getComputedStyle(box);
    var menu = document.createElement("div");
    menu.className = "menu picks";
    menu.setAttribute("role", "listbox");
    var rows = document.createElement("div");
    rows.className = "pick-rows";
    menu.appendChild(rows);
    // A press anywhere in it -- on its scroll bar as much as on a row -- is
    // not a press somewhere else: the Files menu and the options shut on
    // any click that reaches the page, and the list hangs outside them.
    menu.addEventListener("click", function (ev) { ev.stopPropagation(); });
    var chosen = null, n = 0;
    function addRow(option) {
      if (option.tagName !== "OPTION" || option.hidden) { return; }
      var row = document.createElement("button");
      row.type = "button";
      row.tabIndex = -1;
      row.setAttribute("role", "option");
      row.setAttribute("aria-selected", option.selected ? "true" : "false");
      var words = document.createElement("span");
      words.className = "pick-words";
      words.textContent = option.textContent;
      row.appendChild(words);
      // the tick stands where the box's own arrow does
      row.insertAdjacentHTML("beforeend", option.selected ? tickArt()
                                                          : '<span class="tick"></span>');
      if (option.selected) { row.classList.add("on"); chosen = row; }
      row.disabled = option.disabled ||
                     !!(option.parentNode && option.parentNode.disabled);
      row.style.setProperty("--i", n++);
      row.onclick = function (ev) {
        ev.stopPropagation();
        dropPick(box, option);
      };
      rows.appendChild(row);
    }
    Array.prototype.forEach.call(box.children, function (kid) {
      if (kid.tagName !== "OPTGROUP") { addRow(kid); return; }
      var head = document.createElement("h4");
      head.textContent = kid.label;
      rows.appendChild(head);
      Array.prototype.forEach.call(kid.children, addRow);
    });

    // Its words start where the box's words start and stop where the box
    // keeps room for its arrow, its tick sits under the arrow, and its
    // corners are the box's corners -- so a list of words the box was made
    // wide enough for is exactly as wide as the box.
    function px(v) { return parseFloat(v) || 0; }
    var arrow = /(\d+(?:\.\d+)?)px/.exec(look.backgroundPositionX || "");
    menu.style.fontSize = look.fontSize;
    menu.style.setProperty("--pick-in", Math.max(4, px(look.paddingLeft) - 4) + "px");
    menu.style.setProperty("--pick-end", Math.max(20, px(look.paddingRight) - 4) + "px");
    menu.style.setProperty("--pick-out", Math.max(3, (arrow ? +arrow[1] : 11) - 4.5) + "px");
    menu.style.setProperty("--pick-round", look.borderBottomLeftRadius);
    document.body.appendChild(menu);

    // Below the box if it fits there or there is more room there than
    // above; as long as its rows, or as long as there is room for.
    var at = box.getBoundingClientRect();
    menu.style.minWidth = at.width + "px";
    var below = innerHeight - at.bottom - 8, above = at.top - 8;
    var down = menu.offsetHeight <= below || below >= above;
    var edges = menu.offsetHeight - rows.offsetHeight;
    function fitRows(at) {
      var most = Math.max(90, (down ? innerHeight - at.bottom : at.top) - 8 - edges) + "px";
      if (rows.style.maxHeight !== most) { rows.style.maxHeight = most; }
    }
    fitRows(at);
    // A long list scrolls, with the page's own bar like everything else.
    ownSliders(rows, frameOf(rows, "room"), { brief: true });
    // measured to the fraction, or the join is a hairline out
    function joinTo(at) {
      menu.style.minWidth = at.width + "px";
      var size = menu.getBoundingClientRect(), wide = size.width, high = size.height;
      var left = Math.max(8, Math.min(at.left, innerWidth - wide - 8));
      menu.style.left = left + "px";
      menu.style.top = (down ? at.bottom - 1 : at.top + 1 - high) + "px";
      // Where it runs out past the box, that corner is a corner again.
      menu.classList.toggle("past-left", left < at.left - 0.5);
      menu.classList.toggle("past-right", left + wide > at.right + 0.5);
    }
    joinTo(at);
    menu.classList.add(down ? "down" : "up");
    box.classList.add(down ? "drop-down" : "drop-up");
    box.setAttribute("aria-expanded", "true");
    dropOpen = { box: box, menu: menu, at: at };

    // And joined it stays.  A program running beside it moves the page
    // about under the list with nobody touching anything -- the tape
    // filling and pushing the cards under it down, the table of what the
    // program holds unfolding, the panel's bar sliding in and narrowing
    // everything -- and a list that shut whenever its box moved or changed
    // size could not be used while a program ran.  So it is looked at once
    // a frame and follows its box, and goes only when the box does: taken
    // off the page, put away, turned off, or moved out of sight.
    var clips = [];                      // what cuts off what spills out of it
    for (var outer = box.parentElement; outer && outer !== document.body;
         outer = outer.parentElement) {
      var its = getComputedStyle(outer);
      if (its.overflowX !== "visible" || its.overflowY !== "visible") { clips.push(outer); }
    }
    function inSight(r) {
      var x = r.left + r.width / 2, y = r.top + r.height / 2;
      if (x < 0 || y < 0 || x > innerWidth || y > innerHeight) { return false; }
      return clips.every(function (clip) {
        var c = clip.getBoundingClientRect();
        return x >= c.left && x <= c.right && y >= c.top && y <= c.bottom;
      });
    }
    (function stayJoined() {
      dropOpen.frame = requestAnimationFrame(function () {
        if (!dropOpen || dropOpen.menu !== menu) { return; }
        if (box.disabled || !box.isConnected) { shutDropList(); return; }
        var now = box.getBoundingClientRect(), was = dropOpen.at;
        if (now.left !== was.left || now.top !== was.top ||
            now.width !== was.width || now.height !== was.height) {
          if (!now.width || !inSight(now)) { shutDropList(); return; }
          fitRows(now);
          joinTo(now);
          dropOpen.at = now;
        }
        stayJoined();
      });
    })();

    // The one chosen is where the list opens, in the middle of it.
    var first = chosen || live()[0];
    if (first) {
      var gap = first.getBoundingClientRect().top - rows.getBoundingClientRect().top;
      rows.scrollTop = gap - (rows.clientHeight - first.offsetHeight) / 2;
      first.focus({ preventScroll: true });
    }
    void menu.offsetWidth;
    menu.classList.add("in");            // 07-motion.css unfolds it

    function live() {
      return all("button", rows).filter(function (row) { return !row.disabled; });
    }
    function goTo(row) {
      if (!row) { return; }
      row.focus({ preventScroll: true });
      var r = row.getBoundingClientRect(), s = rows.getBoundingClientRect();
      if (r.top < s.top) { rows.scrollTop -= s.top - r.top; }
      else if (r.bottom > s.bottom) { rows.scrollTop += r.bottom - s.bottom; }
    }
    // The pointer and the keys move one highlight between them, as they
    // do in the machine's list, rather than one each.
    rows.addEventListener("pointermove", function (ev) {
      var row = ev.target.closest && ev.target.closest("button");
      if (row && !row.disabled && document.activeElement !== row) {
        row.focus({ preventScroll: true });
      }
    });
    var typed = "", typedAt = 0;
    menu.addEventListener("keydown", function (ev) {
      var list = live(), at = list.indexOf(document.activeElement);
      var page = Math.max(1, Math.floor(rows.clientHeight / 30));
      var to = null;
      // The keys are the list's while it is open, as they are the machine's
      // list's: a letter typed to find a row is not a shortcut for the
      // chart, and Escape shuts the list, not the screen behind it.
      if (!ev.ctrlKey && !ev.metaKey) { ev.stopPropagation(); }
      if (ev.key === "Escape") {
        ev.preventDefault();
        shutDropList(true);
        return;
      }
      if (ev.key === "Tab") { shutDropList(true); return; }
      if (ev.altKey && (ev.key === "ArrowDown" || ev.key === "ArrowUp")) {
        ev.preventDefault();
        if (at >= 0) { list[at].click(); } else { shutDropList(true); }
        return;
      }
      if (ev.key === "ArrowDown") { to = list[Math.min(list.length - 1, at + 1)]; }
      else if (ev.key === "ArrowUp") { to = list[Math.max(0, at - 1)]; }
      else if (ev.key === "Home") { to = list[0]; }
      else if (ev.key === "End") { to = list[list.length - 1]; }
      else if (ev.key === "PageDown") { to = list[Math.min(list.length - 1, at + page)]; }
      else if (ev.key === "PageUp") { to = list[Math.max(0, at - page)]; }
      else if (ev.key.length === 1 && ev.key !== " " &&
               !ev.ctrlKey && !ev.metaKey && !ev.altKey) {
        // Typing the start of one goes to it; the same letter again goes
        // on to the next that starts with it.
        var now = Date.now();
        typed = (now - typedAt > 700 ? "" : typed) + ev.key.toLowerCase();
        typedAt = now;
        var from = typed.length === 1 ? at + 1 : Math.max(0, at);
        for (var k = 0; k < list.length; k++) {
          var row = list[(from + k) % list.length];
          if (row.textContent.trim().toLowerCase().indexOf(typed) === 0) { to = row; break; }
        }
        if (!to) { return; }
      } else { return; }
      ev.preventDefault();
      goTo(to);
    });
  }

  // Opened by a press of the mouse, the way the machine's is, and shut by
  // another press on the box.  The press itself is kept from opening the
  // machine's list, and from taking the focus with it, so the box is given
  // the focus by hand; the list is opened on the click that follows, once
  // that click is over.  It is caught on its way down rather than on its
  // way back up, because a box inside the Files menu never sends it back
  // up (that menu keeps its clicks to itself, or it would shut), and it is
  // acted on afterwards, so that the page shutting whatever menu was open
  // before does not shut this one along with it.
  document.addEventListener("pointerdown", function (ev) {
    lastPointer = ev.pointerType || "mouse";
    if (dropOpen && !dropOpen.menu.contains(ev.target) && ev.target !== dropOpen.box) {
      shutDropList();
    }
  }, true);
  function dropBox(ev) {
    var box = ev.target;
    if (!box || box.tagName !== "SELECT" || box.disabled || box.multiple ||
        box.size > 1) { return null; }
    return box;
  }
  document.addEventListener("mousedown", function (ev) {
    var box = dropBox(ev);
    if (!box || ev.button !== 0 || lastPointer === "touch") { return; }
    ev.preventDefault();
    box._dropWasOpen = !!(dropOpen && dropOpen.box === box);
    box._dropPressed = true;
    box.focus({ preventScroll: true });
  });
  document.addEventListener("click", function (ev) {
    var box = dropBox(ev);
    if (!box || !box._dropPressed) { return; }
    box._dropPressed = false;
    var wasOpen = box._dropWasOpen;
    box._dropWasOpen = false;
    setTimeout(function () {
      if (wasOpen) { shutDropList(true); }
      else if (box.isConnected && !box.disabled) { openDropList(box); }
    }, 0);
  }, true);
  // And from the keys that open the machine's: Space, Enter, F4 and Alt
  // with an arrow.  The arrows on their own still step through the choices
  // without opening anything, as they always have.
  document.addEventListener("keydown", function (ev) {
    var box = dropBox(ev);
    if (!box || ev.ctrlKey || ev.metaKey) { return; }
    var opens = ev.key === " " || ev.key === "Enter" || ev.key === "F4" ||
                (ev.altKey && (ev.key === "ArrowDown" || ev.key === "ArrowUp"));
    if (!opens) { return; }
    ev.preventDefault();
    openDropList(box);
  });
  // A list left hanging where its box no longer is would be pointing at
  // nothing, so it goes when its box is scrolled away under it, or the
  // window changes.  Only a scroll that really carries the box off: while
  // a program runs, the chart following it, the pseudocode showing its line
  // and the tape keeping to its foot all scroll on every step, and a list
  // that shut at any scroll at all was gone again before the pointer could
  // reach it.  Nor does the panel's own scroll count when all it did was
  // hold the box still while the tape grew above it.
  document.addEventListener("scroll", function (ev) {
    var moved = ev.target;
    if (!dropOpen || dropOpen.menu.contains(moved)) { return; }
    if (moved !== document && !(moved.contains && moved.contains(dropOpen.box))) { return; }
    var now = dropOpen.box.getBoundingClientRect(), was = dropOpen.at;
    if (Math.abs(now.left - was.left) > 0.5 || Math.abs(now.top - was.top) > 0.5) {
      shutDropList();
    }
  }, true);
  window.addEventListener("resize", function () { shutDropList(); });
  window.addEventListener("blur", function () { shutDropList(); });
