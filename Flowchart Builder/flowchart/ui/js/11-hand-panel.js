// ---------------------------------------------------------------------------
//  11-hand-panel.js -- what the panel shows for a shape or an arrow
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ---- the panel side of it ---------------------------------------------
  // Thirty shapes in a grid of thirty little drawings was a lot to look
  // through for the half-dozen a flowchart is mostly made of, and on a
  // touch screen none of them had a name.  So the shapes the rules give
  // each kind of step (ruleChoices, 13-hand-rules.js) come first, each
  // named for the step it is, and every shape there is is sorted into
  // four sets behind a button each, a menu of them with their names.
  var SHAPE_SETS = [
    ["sg_basic", ["rect", "roundrect", "oval", "circle", "diamond", "hex", "io", "io_back"]],
    ["sg_flow", ["sub", "loop", "trap", "delay", "parallel", "step", "offpage"]],
    ["sg_data", ["doc", "docs", "manual", "card", "store", "stored", "table", "screen"]],
    ["sg_other", ["note", "callout", "cloud", "actor", "cube", "arrow", "text"]]
  ];

  // The sets, holding only shapes this page can draw -- and any shape it
  // can that no set names goes in the last, so none is ever out of reach.
  function shapeSets() {
    var placed = {};
    var sets = SHAPE_SETS.map(function (set) {
      var kinds = set[1].filter(function (kind) {
        return SHAPE_LIST.indexOf(kind) >= 0 && !placed[kind] && (placed[kind] = true);
      });
      return { name: set[0], kinds: kinds };
    });
    var left = SHAPE_LIST.filter(function (kind) { return !placed[kind]; });
    sets[sets.length - 1].kinds = sets[sets.length - 1].kinds.concat(left);
    return sets.filter(function (set) { return set.kinds.length; });
  }

  function drawAdders() {
    var box = el("#adders");
    if (!box) { return; }
    box.innerHTML = "";
    var tiles = document.createElement("div");
    tiles.className = "adder-tiles";
    ruleChoices().forEach(function (one) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn adder";
      b.title = kindName(one.kind);      // what the shape itself is called
      b.setAttribute("aria-label", one.name);
      b.innerHTML = keyMark(one.kind) + '<span class="adder-name"></span>';
      b.lastChild.textContent = one.name;
      b.onclick = function () { addNode(one.kind); };
      lendAdder(b, one.kind);
      tiles.appendChild(b);
    });
    box.appendChild(tiles);
    var sets = document.createElement("div");
    sets.className = "adder-sets";
    shapeSets().forEach(function (set) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "btn small set-btn";
      b.setAttribute("aria-haspopup", "menu");
      b.setAttribute("aria-expanded", "false");
      b.innerHTML = '<span class="set-name"></span><svg viewBox="0 0 10 10" aria-hidden="true">' +
                    '<path d="M2.2 3.8 5 6.6l2.8-2.8"/></svg>';
      b.firstChild.textContent = TXT[set.name] || set.name;
      b.onclick = function (ev) {
        ev.stopPropagation();            // or the click that opened it shuts it
        if (b.getAttribute("aria-expanded") === "true") { closeMenu(); return; }
        var r = b.getBoundingClientRect();
        openMenu(r.left, r.bottom + 4, shapeRows(set.kinds, addNode, true), "shape-set");
        b.setAttribute("aria-expanded", "true");
      };
      sets.appendChild(b);
    });
    box.appendChild(sets);
    paperTakesDrops();
  }

  // Dragged onto the paper it lands where it is dropped, which is what
  // anyone who has used a drawing program will try first.  Clicking it
  // still drops one below whatever is in hand, for anyone who would
  // rather not drag.
  function lendAdder(b, kind) {
    b.draggable = true;
    b.ondragstart = function (ev) {
      ev.dataTransfer.setData("text/plain", kind);
      ev.dataTransfer.effectAllowed = "copy";
      dragging_kind = kind;
    };
    b.ondragend = function () { dragging_kind = null; };
  }

  var dragging_kind = null;              // the shape being carried in

  function dropOnPaper(where) {
    var stage = el("#stage"), chart = el("#chart");
    if (!chart || !chart.getScreenCTM) { return false; }
    var frame = chart.getScreenCTM();
    if (!frame) { return false; }
    var spot = chart.createSVGPoint();
    spot.x = where.clientX;
    spot.y = where.clientY;
    spot = onHand(spot.matrixTransform(frame.inverse()));
    var kind = dragging_kind ||
               (where.dataTransfer && where.dataTransfer.getData("text/plain"));
    if (!kind) { return false; }
    addNode(kind, { x: spot.x, y: spot.y });
    dragging_kind = null;
    return true;
  }

  function paperTakesDrops() {
    var stage = el("#stage");
    if (!stage || stage.dataset.drops) { return; }
    stage.dataset.drops = "yes";
    stage.addEventListener("dragover", function (ev) {
      if (!byHand) { return; }
      ev.preventDefault();
      ev.dataTransfer.dropEffect = "copy";
      stage.classList.add("taking");
    });
    stage.addEventListener("dragleave", function (ev) {
      if (ev.target === stage) { stage.classList.remove("taking"); }
    });
    stage.addEventListener("drop", function (ev) {
      stage.classList.remove("taking");
      if (!byHand) { return; }
      ev.preventDefault();
      dropOnPaper(ev);
    });
  }

  function addNode(kind, at) {
    keepUndo();
    var under = nodeById(picked), x = 260, y = 60;
    if (at) {                           // dropped somewhere in particular
      x = Math.round(at.x / HAND_GRID) * HAND_GRID;
      y = Math.round(at.y / HAND_GRID) * HAND_GRID;
    } else if (under) {                 // under whatever is being worked on
      x = under.x;
      y = under.y + under.h / 2 + 70;
      while (hand.nodes.some(function (n) {
        return Math.abs(n.x - x) < 60 && Math.abs(n.y - y) < 40;
      })) { y += 40; }
    } else if (hand.nodes.length) {
      hand.nodes.forEach(function (n) { y = Math.max(y, n.y + n.h / 2 + 70); });
    }
    var node = { id: hand.next++, kind: kind, text: firstWords(kind),
                 x: x, y: y, w: 140, h: 46 };
    measure(node);
    hand.nodes.push(node);
    picked = node.id;
    drawHand();
    drawHandPanel();
  }

  function firstWords(kind) {
    if (endsKind(kind)) {                // an oval, or the rules' Start / End
      return hand.nodes.some(function (n) { return endsKind(n.kind); })
             ? TXT.end : TXT.start;
    }
    // A words-only box has no outline, so an empty one would be nothing at
    // all on the paper.  It arrives saying what it is, ready to be typed over.
    if (kind === "text") { return TXT.n_text || "Text"; }
    return "";
  }

  function drawHandPanel() {
    drawSelection();                     // the Style side is about it as well
    drawSelBar();                        // and the bar over the paper (11-hand-many.js)
    var box = el("#hand-sel");
    if (!box) { return; }
    box.innerHTML = "";
    var link = linkById(chosen);
    if (link) { return arrowPanel(box, link); }
    if (many.length > 1) { return groupPanel(box); }   // 11-hand-many.js
    var node = nodeById(picked);
    // Nothing picked, nothing said: how to go about it is behind the i
    // beside Add a shape (handHelp, 25-keys.js), not written under it.
    if (!node) { return; }
    var name = kindName(node.kind);
    var head = document.createElement("div");
    head.className = "what";
    head.style.cssText = "font-weight:600; margin:10px 0 6px";
    head.textContent = name;
    box.appendChild(head);
    var tipBox = document.createElement("div");   // the rules' shape for it,
    box.appendChild(tipBox);                      //   offered (13-hand-rules.js)
    ruleTip(tipBox, node);

    function put(bit) { box.appendChild(bit); }
    var label = document.createElement("label");
    label.style.cssText = "display:block; font-size:11.5px; color:var(--muted)";
    label.textContent = TXT.words_in;
    box.appendChild(label);
    var words = document.createElement("textarea");
    words.className = "field";
    words.style.cssText = "height:56px; font-family:inherit; font-size:13px";
    words.value = node.text || "";
    words.oninput = function () {
      node.text = words.value;
      drawHand();
      tipBox.innerHTML = "";             // what the words make it may have changed
      ruleTip(tipBox, node);
    };
    box.appendChild(words);

    var go = document.createElement("div");
    go.style.cssText = "display:flex; gap:8px; margin-top:10px";
    var join = document.createElement("button");
    join.className = "btn small" + (joining ? " primary" : "");
    join.textContent = joining ? TXT.connect_now : TXT.connect;
    join.onclick = function () { joining = !joining; joinFrom = null; drawHandPanel(); };
    var cut = document.createElement("button");
    cut.className = "btn small";
    cut.textContent = TXT.delete;
    cut.onclick = function () {
      hand.nodes = hand.nodes.filter(function (n) { return n.id !== node.id; });
      hand.links = hand.links.filter(function (l) {
        return l.from !== node.id && l.to !== node.id;
      });
      picked = null; joining = false;
      drawHand(); drawHandPanel(); showReport();
    };
    go.appendChild(join);
    go.appendChild(cut);
    put(go);

    // how big, and which way round
    var sizing = document.createElement("div");
    sizing.className = "trio";
    [[TXT.width, "w", 30, 600], [TXT.height, "h", 24, 400],
     [TXT.turn, "turn", 0, 350]].forEach(function (item) {
      var cell = document.createElement("label");
      cell.innerHTML = '<span>' + item[0] + "</span>";
      var spin = document.createElement("input");
      spin.type = "number";
      spin.className = "field";
      spin.step = item[1] === "turn" ? 15 : 10;
      spin.min = item[2];
      spin.max = item[3];
      spin.value = Math.round(node[item[1]] || 0);
      spin.oninput = function () {
        var want = parseFloat(spin.value);
        if (isNaN(want)) { return; }
        if (item[1] === "turn") {
          node.turn = ((want % 360) + 360) % 360;
        } else {
          node.own = true;                 // a size of its own from now on
          node[item[1]] = Math.max(item[2], Math.min(item[3], want));
          if (node.kind === "circle") { node.h = node.w; }
        }
        drawHand();
      };
      cell.appendChild(spin);
      sizing.appendChild(cell);
    });
    put(sizing);
    var back = document.createElement("button");
    back.className = "btn small";
    back.style.marginTop = "6px";
    back.textContent = TXT.fit_words;
    back.onclick = function () {
      node.own = false; node.turn = 0;
      measure(node, true);
      drawHand(); drawHandPanel();
    };
    put(back);

    // and its colors, right here rather than on the other side of the panel
    var paints = document.createElement("div");
    paints.className = "trio";
    var mine = style.nodes["h" + node.id] = style.nodes["h" + node.id] || {};
    var k = kindColors(node.kind);
    [[TXT.fill, "fill", k.fill || "#ffffff"],
     [TXT.outline, "line", k.line || style.ink || "#000000"],
     [TXT.text, "text", k.text || style.words || style.ink || "#000000"]]
      .forEach(function (item) {
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
    var title = document.createElement("div");
    title.className = "small-head";
    title.textContent = TXT.colors_here;
    put(title);
    put(paints);


    var outs = outOf(node.id);
    var list = document.createElement("div");
    list.style.marginTop = "10px";
    list.innerHTML = '<div style="font-size:11.5px; color:var(--muted)">' +
                     TXT.goes_to + "</div>";
    if (!outs.length) {
      list.innerHTML += '<div class="hint">' + TXT.nothing_yet + "</div>";
    }
    outs.forEach(function (link) {
      var to = nodeById(link.to);
      var row = document.createElement("div");
      row.className = "row";
      row.innerHTML = '<span class="name">' +
                      escaped((to && to.text) || (to ? to.kind : "?")).slice(0, 22) +
                      "</span>";
      if (asksKind(node.kind) || outs.length > 1) {
        var tag = document.createElement("input");
        tag.className = "field";
        tag.style.cssText = "width:78px; padding:3px 6px";
        tag.value = link.label || "";
        tag.oninput = function () { link.label = tag.value; drawHand(); };
        row.appendChild(tag);
      }
      var cut = document.createElement("button");
      cut.className = "btn small";
      cut.textContent = "×";
      cut.onclick = function () {
        hand.links = hand.links.filter(function (l) { return l !== link; });
        drawHand(); drawHandPanel();
      };
      row.appendChild(cut);
      list.appendChild(row);
    });
    box.appendChild(list);
  }

  // One shape leads to another.  `fromSide` and `toSide` are the dots it
  // was drawn from and to, if it was drawn from and to dots (0-3, in the
  // order ports() gives them): those are its sides from then on.  A side
  // not given is left to the arrow to find, and it takes a free one.
  function joinUp(fromId, toId, fromSide, toSide) {
    joinFrom = null;
    if (!fromId || !toId || fromId === toId) { return; }
    var fixed = {};
    if (PORT_SIDES[fromSide]) { fixed.fromSide = PORT_SIDES[fromSide]; }
    if (PORT_SIDES[toSide]) { fixed.toSide = PORT_SIDES[toSide]; }
    var already = outOf(fromId).filter(function (l) { return l.to === toId; })[0];
    if (already) {
      // Drawn again between the same two, from other dots: the one arrow
      // moves over to those, which is how an arrow is given other sides.
      if (!fixed.fromSide && !fixed.toSide) { return; }
      keepUndo();
      if (fixed.fromSide) { already.fromSide = fixed.fromSide; }
      if (fixed.toSide) { already.toSide = fixed.toSide; }
    } else {
      keepUndo();
      var from = nodeById(fromId);
      var tag = "";
      if (from && asksKind(from.kind)) {
        tag = outOf(fromId).length ? TXT.no : TXT.yes;
      }
      var link = { from: fromId, to: toId, label: tag };
      if (fixed.fromSide) { link.fromSide = fixed.fromSide; }
      if (fixed.toSide) { link.toSide = fixed.toSide; }
      hand.links.push(link);
    }
    joining = false;
    drawHand();
    drawHandPanel();
    showReport();
  }

  // The other way round: from where it went to where it came from, by the
  // same two sides, so turning an arrow round turns it and does not move it.
  function turnLink(link) {
    var was = link.from; link.from = link.to; link.to = was;
    var side = link.fromSide; link.fromSide = link.toSide; link.toSide = side;
    if (!link.fromSide) { delete link.fromSide; }
    if (!link.toSide) { delete link.toSide; }
  }

  function linkById(id) {
    return hand.links.filter(function (l) { return l.id === id; })[0] || null;
  }

  // Held to the two sides it is on now -- or let go to find its own again.
  function pinLink(link, on) {
    keepUndo();
    if (on) {
      var pts = routeAll()[hand.links.indexOf(link)];
      if (pts && pts.sides) {
        link.fromSide = PORT_SIDES[pts.sides[0]];
        link.toSide = PORT_SIDES[pts.sides[1]];
      }
      link.pin = true;
    } else {
      delete link.pin;
    }
    drawHand();
    drawHandPanel();
  }
  function pickLink(id) {
    chosen = id;
    picked = null;
    joining = false;
    drawHand();
    drawHandPanel();
  }

  function arrowPanel(box, link) {       // an arrow has its own few things
    var from = nodeById(link.from), to = nodeById(link.to);
    var head = document.createElement("div");
    head.style.cssText = "font-weight:600; margin:10px 0 6px";
    head.textContent = TXT.an_arrow;
    box.appendChild(head);
    var says = document.createElement("div");
    says.className = "hint";
    says.style.marginBottom = "8px";
    says.textContent = ((from && from.text) || "?").slice(0, 16) + "  \u2192  " +
                       ((to && to.text) || "?").slice(0, 16);
    box.appendChild(says);

    var label = document.createElement("label");
    label.style.cssText = "display:block; font-size:11.5px; color:var(--muted)";
    label.textContent = TXT.word_on_it;
    box.appendChild(label);
    var tag = document.createElement("input");
    tag.className = "field";
    tag.value = link.label || "";
    tag.oninput = function () { link.label = tag.value; drawHand(); };
    box.appendChild(tag);

    var trio = document.createElement("div");
    trio.className = "trio";
    var thick = document.createElement("label");
    thick.innerHTML = "<span>" + TXT.thickness + "</span>";
    var spin = document.createElement("input");
    spin.type = "number";
    spin.className = "field";
    spin.min = 1; spin.max = 6; spin.step = 0.5;
    spin.value = link.wide || 1.3;
    spin.oninput = function () { link.wide = parseFloat(spin.value) || 1.3; drawHand(); };
    thick.appendChild(spin);
    trio.appendChild(thick);
    var paint = document.createElement("label");
    paint.innerHTML = "<span>" + TXT.color_of_it + "</span>";
    paint.appendChild(swatch(link.color, style.ink || "#000000", function (v) {
      link.color = v; drawHand();
    }));
    trio.appendChild(paint);
    box.appendChild(trio);

    var switches = document.createElement("div");
    switches.style.cssText = "display:flex; gap:14px; margin-top:10px; flex-wrap:wrap";
    [[TXT.dashed, "dash", !!link.dash],
     [TXT.with_head, "head", link.head !== false]].forEach(function (item) {
      var one = document.createElement("label");
      one.className = "switch";
      var tick = document.createElement("input");
      tick.type = "checkbox";
      tick.checked = item[2];
      tick.onchange = function () {
        link[item[1]] = item[1] === "head" ? tick.checked : tick.checked;
        drawHand();
      };
      one.appendChild(tick);
      one.appendChild(document.createTextNode(item[0]));
      switches.appendChild(one);
    });
    // Pinned, it keeps the two sides it is on now however the shapes are
    // moved; otherwise it finds its own way, clear of the others (routeAll).
    var pin = document.createElement("label");
    pin.className = "switch";
    var held = document.createElement("input");
    held.type = "checkbox";
    held.checked = !!link.pin;
    held.onchange = function () { pinLink(link, held.checked); };
    pin.appendChild(held);
    pin.appendChild(document.createTextNode(TXT.m_pin));
    switches.appendChild(pin);
    box.appendChild(switches);

    var go = document.createElement("div");
    go.style.cssText = "display:flex; gap:8px; margin-top:10px";
    var flip = document.createElement("button");
    flip.className = "btn small";
    flip.textContent = TXT.turn_it_round;
    flip.onclick = function () {
      turnLink(link);
      drawHand(); drawHandPanel(); showReport();
    };
    var cut = document.createElement("button");
    cut.className = "btn small";
    cut.textContent = TXT.delete;
    cut.onclick = function () {
      hand.links = hand.links.filter(function (l) { return l !== link; });
      chosen = null;
      drawHand(); drawHandPanel(); showReport();
    };
    go.appendChild(flip);
    go.appendChild(cut);
    box.appendChild(go);
  }

  function handClick(id, side) {          // a shape was clicked on the chart
    chosen = null;                        //   (or one of its dots: `side`)
    if (joining && picked && picked !== id) {
      joinUp(picked, id, joinFrom && joinFrom.id === picked ? joinFrom.side : null,
             side);
      return;
    }
    picked = id;
    joining = false;
    drawHand();
    drawHandPanel();
    var g = el('.node[data-i="h' + id + '"]', chart);  // the color side of
    if (g) { select(g); }                              //   the panel follows
  }

