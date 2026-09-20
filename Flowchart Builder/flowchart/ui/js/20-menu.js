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

  function openMenu(x, y, items) {
    closeMenu();
    var menu = document.createElement("div");
    menu.className = "menu";
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
      { name: TXT.c_clear || "No color of its own", go: function () {
          delete mine.fill; delete mine.line; delete mine.text;
          style.nodes[which] = mine;
          paint();
          keep();
        } }
    ];
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
    ].concat(colorRows("h" + node.id, style.nodes["h" + node.id] || {},
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

