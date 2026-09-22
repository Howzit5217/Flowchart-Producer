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
  }

  function closeMenu() {
    all(".menu").forEach(function (m) { m.remove(); });
    letGoOfMenus();
  }
  document.addEventListener("click", function (ev) {
    if (!ev.target.closest || !ev.target.closest(".menu")) { closeMenu(); }
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
  // now; pressing it opens the machine's own color picker, and the shape
  // takes the color as you move about in it, so you can see what you are
  // choosing before you settle on it.
  function paintRow(name, now, fallback, onPick) {
    return { swatch: now || fallback, name: name, keepOpen: true,
             go: function (row) {
               var pick = document.createElement("input");
               pick.type = "color";
               pick.value = now || fallback;
               pick.style.cssText = "position:absolute;opacity:0;pointer-events:none";
               // It lives inside the row, so its own click would bubble back
               // to the row and open another one, and another, until the
               // stack gave out.  It stops here.
               pick.addEventListener("click", function (e) { e.stopPropagation(); });
               row.appendChild(pick);
               pick.oninput = function () {
                 onPick(pick.value);
                 var dot = row.querySelector(".dot");
                 if (dot) { dot.style.background = pick.value; }
               };
               pick.onchange = function () { setTimeout(function () { pick.remove(); }, 0); };
               pick.click();
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
      { name: TXT.connect, go: function () { joining = true; drawHandPanel(); } },
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
          var was = link.from; link.from = link.to; link.to = was;
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
