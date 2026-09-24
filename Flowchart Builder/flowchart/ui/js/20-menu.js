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
      if (b.id === "more") { b.setAttribute("aria-expanded", "false"); }
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
          b.textContent = tool.mark;
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
      row.style.position = "relative";
      row.innerHTML = (item.swatch
                       ? '<span class="dot" style="background:' + item.swatch + '"></span>'
                       : (item.mark || "")) +
                      "<span>" + item.name + "</span>";
      row.onclick = function (ev) {
        ev.stopPropagation();
        if (!item.keepOpen) { closeMenu(); }
        item.go(row);
      };
      menu.appendChild(row);
    });
    document.body.appendChild(menu);
    var room = menu.getBoundingClientRect();
    menu.style.left = Math.max(8, Math.min(x, innerWidth - room.width - 8)) + "px";
    menu.style.top = Math.max(8, Math.min(y, innerHeight - room.height - 8)) + "px";
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

  function colorRows(which, mine, fallbacks) {
    var first = true;
    function set(key, value) {
      if (first) { first = false; keepUndo(); }   // one step for one choice
      mine[key] = value;
      style.nodes[which] = mine;
      paint();
      keep();
    }
    return [
      paintRow(TXT.c_fill || "Fill", mine.fill, fallbacks.fill,
               function (v) { set("fill", v); }),
      paintRow(TXT.c_line || "Border", mine.line, fallbacks.line,
               function (v) { set("line", v); }),
      paintRow(TXT.c_words || "Words", mine.text, fallbacks.text,
               function (v) { set("text", v); }),
      paintRow(TXT.t_mark, mine.mark, MARKERS[0][0],
               function (v) { set("mark", v); }),
      wordTools(which),
      // Everything this shape was given of its own -- colors, how its words
      // look, its border -- taken off together, one step to step back from.
      { name: TXT.c_clear || "No style of its own", go: function () {
          keepUndo();
          var was = typeSign(style);
          Object.keys(mine).forEach(function (key) { delete mine[key]; });
          style.nodes[which] = mine;
          restyled(typeSign(style) !== was);
          drawSelection();
        } }
    ];
  }

  // B, I, U and S, and the words a size smaller or bigger, for one shape.
  function wordTools(which) {
    function flip(what) {
      return function () {
        var on = flipLook(which, what);
        drawSelection();
        return on;
      };
    }
    function grow(way) {
      return function () { growWords(which, way); drawSelection(); };
    }
    var tools = LOOK_KEYS.map(function (one) {
      return { mark: one[2], on: lookOn(which, one[0]), go: flip(one[0]),
               name: TXT[one[1]] + (one[3] ? " (" + one[3] + ")" : "") };
    });
    if (CAN_REFLOW) {
      tools.push({ mark: "A−", name: TXT.t_smaller + " (Ctrl+Shift+<)", go: grow(-1) },
                 { mark: "A+", name: TXT.t_bigger + " (Ctrl+Shift+>)", go: grow(1) });
    }
    return { tools: tools };
  }

  function shapeMenu(node, x, y) {
    picked = node.id;
    chosen = null;
    drawHand();
    drawHandPanel();
    openMenu(x, y, [
      { name: TXT.m_type, go: function () {
          var g = el('.node[data-i="h' + node.id + '"]', chart);
          if (g) { typeInto(g); }
        } },
      { name: TXT.connect, go: function () {
          joining = true; joinFrom = null; drawHandPanel();
        } },
      { name: TXT.m_copy, go: function () {
          keepUndo();
          var twin = JSON.parse(JSON.stringify(node));
          twin.id = hand.next++;
          twin.x += 30; twin.y += 30;
          hand.nodes.push(twin);
          picked = twin.id;
          drawHand(); drawHandPanel();
        } },
      { name: TXT.m_turn, go: function () {
          keepUndo();
          node.turn = ((node.turn || 0) + 90) % 360;
          drawHand(); drawHandPanel();
        } },
      "-"
    ].concat(colorRows("h" + node.id,
                       // the shape's own, kept, so that everything this menu
                       // does to it -- colors and words alike -- is to one
                       // and the same record of how it looks
                       style.nodes["h" + node.id] = style.nodes["h" + node.id] || {},
                       { fill: "#ffffff", line: style.ink || "#000000",
                         text: style.words || style.ink || "#000000" }))
     .concat([
      "-",
      { name: TXT.delete, go: function () {
          hand.nodes = hand.nodes.filter(function (n) { return n.id !== node.id; });
          hand.links = hand.links.filter(function (l) {
            return l.from !== node.id && l.to !== node.id;
          });
          picked = null;
          drawHand(); drawHandPanel(); showReport();
        } }
    ]));
  }

  function arrowMenu(link, x, y) {
    chosen = link.id;
    picked = null;
    drawHand();
    drawHandPanel();
    function tag(word) {
      return { name: word === "" ? TXT.m_no_word : '"' + word + '"',
               go: function () { link.label = word; drawHand(); drawHandPanel(); } };
    }
    openMenu(x, y, [
      tag(TXT.yes), tag(TXT.no), tag(""),
      "-",
      { name: link.dash ? TXT.m_solid : TXT.dashed, go: function () {
          link.dash = !link.dash; drawHand(); drawHandPanel();
        } },
      { name: TXT.turn_it_round, go: function () {
          turnLink(link);
          drawHand(); drawHandPanel(); showReport();
        } },
      "-",
      { name: TXT.delete, go: function () {
          hand.links = hand.links.filter(function (l) { return l !== link; });
          chosen = null;
          drawHand(); drawHandPanel(); showReport();
        } }
    ]);
  }

  function paperMenu(x, y) {
    var spots = ["rect", "oval", "io", "diamond", "text"];
    openMenu(x, y, spots.map(function (kind) {
      return { mark: keyMark(kind), name: kindName(kind),
               go: function () { addNode(kind); } };
    }).concat([
      "-",
      { name: TXT.m_fit, go: function () { el("#fit").click(); } }
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
    var box = dropOpen.box;
    dropOpen.menu.remove();
    if (dropOpen.watch) { dropOpen.watch.disconnect(); }
    dropOpen = null;
    box.classList.remove("drop-down", "drop-up");
    box.setAttribute("aria-expanded", "false");
    if (back && box.isConnected) { box.focus({ preventScroll: true }); }
  }

  // Chosen: said to the <select> the way it says it itself, an input and
  // then a change, and only when it is a change -- choosing the one that
  // was already chosen tells nobody anything.
  function dropPick(box, option) {
    shutDropList(true);
    if (option.disabled || option.closest("select") !== box) { return; }
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
    rows.style.maxHeight = Math.max(90, (down ? below : above) - edges) + "px";
    // A long list scrolls, with the page's own bar like everything else.
    ownSliders(rows, frameOf(rows, "room"), { brief: true });
    // measured to the fraction, or the join is a hairline out
    var size = menu.getBoundingClientRect(), wide = size.width, high = size.height;
    var left = Math.max(8, Math.min(at.left, innerWidth - wide - 8));
    menu.style.left = left + "px";
    menu.style.top = (down ? at.bottom - 1 : at.top + 1 - high) + "px";
    menu.classList.add(down ? "down" : "up");
    // Where it runs out past the box, that corner is a corner again.
    menu.classList.toggle("past-left", left < at.left - 0.5);
    menu.classList.toggle("past-right", left + wide > at.right + 0.5);
    box.classList.add(down ? "drop-down" : "drop-up");
    box.setAttribute("aria-expanded", "true");
    dropOpen = { box: box, menu: menu };
    // Nor does it stay joined to a box that changes size under it -- the
    // panel narrowing as its bar slides in, say -- so then it shuts too.
    if (window.ResizeObserver) {
      dropOpen.watch = new ResizeObserver(function () {
        var now = box.getBoundingClientRect();
        if (Math.abs(now.width - at.width) > 0.5 || Math.abs(now.height - at.height) > 0.5) {
          shutDropList();
        }
      });
      dropOpen.watch.observe(box);
    }

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
  // nothing, so it goes when anything under it moves, or the window does.
  document.addEventListener("scroll", function (ev) {
    if (dropOpen && !dropOpen.menu.contains(ev.target)) { shutDropList(); }
  }, true);
  window.addEventListener("resize", function () { shutDropList(); });
  window.addEventListener("blur", function () { shutDropList(); });
