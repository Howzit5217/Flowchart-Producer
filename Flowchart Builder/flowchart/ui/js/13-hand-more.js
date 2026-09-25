// ---------------------------------------------------------------------------
//  13-hand-more.js -- the next step, a step put into an arrow, and lining up
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ======================================================= the next step ==
  // Drawing a flowchart by hand was: pick a shape from the row above, find
  // it on the paper, drag it into place, then go back to the first shape
  // and draw an arrow from one to the other -- four moves for what is, in
  // a flowchart, the one thing you do over and over.  So the picked shape
  // wears a + under it, and pressing it asks what comes next and puts it
  // there, joined on, ready to be typed into.  A decision has a second +
  // at its right, for the other answer.
  var PLUS_R = 9;                        // how big the + is
  var PLUS_OFF = 30;                     // how far out from the shape it sits
  var NEXT_GAP = 50;                     // the room left between the two shapes
  var NEXT_KINDS = ["rect", "io", "diamond", "oval"];

  // The + (or two) for the picked shape, drawn by drawHand beside its dots.
  // `at` is where the shape stands on the paper and `about` how much room
  // it takes up once turned.
  function plusMarks(n, at, about) {
    if (joining || many.length > 1) { return ""; }
    var ways = [["foot", at.x, at.y + about.h / 2 + PLUS_OFF]];
    if (n.kind === "diamond" && outOf(n.id).length < 2) {
      ways.push(["right", at.x + about.w / 2 + PLUS_OFF, at.y]);
    }
    return ways.map(function (way) {
      return '<g class="plus" data-i="' + n.id + '" data-way="' + way[0] +
             '" transform="translate(' + way[1] + "," + way[2] + ')">' +
             "<title>" + escaped(TXT.hp_next || "") + "</title>" +
             '<circle r="' + PLUS_R + '" fill="#14427c" stroke="#ffffff" stroke-width="1.5"/>' +
             '<path d="M-4.5,0H4.5M0,-4.5V4.5" stroke="#ffffff" stroke-width="2" ' +
             'stroke-linecap="round" fill="none"/></g>';
    }).join("");
  }

  // What can come next, asked where the + was pressed.
  function plusMenu(fromId, way, x, y) {
    openMenu(x, y, [{ head: TXT.hp_what_next }].concat(NEXT_KINDS.map(function (kind) {
      return { mark: keyMark(kind), name: kindName(kind),
               go: function () { addNext(fromId, way, kind); } };
    })));
  }

  // Put it there, join it on, and open it to be typed into.
  function addNext(fromId, way, kind) {
    var from = nodeById(fromId);
    if (!from || !byHand) { return; }
    keepUndo();
    var node = { id: hand.next++, kind: kind, text: firstWords(kind),
                 x: from.x, y: from.y, w: 140, h: 46 };
    measure(node);
    var a = turned(from), right = way === "right";
    if (right) { node.x = from.x + a.w / 2 + NEXT_GAP + node.w / 2; }
    else { node.y = from.y + a.h / 2 + NEXT_GAP + node.h / 2; }
    node.x = Math.round(node.x / HAND_GRID) * HAND_GRID;
    node.y = Math.round(node.y / HAND_GRID) * HAND_GRID;
    // On past anything already standing where it would go.
    for (var i = 0; i < 200 && crowds(node, node.x, node.y); i++) {
      if (right) { node.x += HAND_GRID * 4; } else { node.y += HAND_GRID * 4; }
    }
    var link = { from: fromId, to: node.id, label: "",
                 fromSide: right ? "right" : "foot", toSide: right ? "left" : "top" };
    if (from.kind === "diamond") { link.label = outOf(fromId).length ? TXT.no : TXT.yes; }
    hand.nodes.push(node);
    hand.links.push(link);
    picked = node.id; chosen = null; many = []; joining = false;
    drawHand(); drawHandPanel(); showReport();
    // An End already says what it is; anything else wants its words.
    var g = kind === "oval" ? null : el('.node[data-i="h' + node.id + '"]', chart);
    if (g) { typeInto(g); }
  }

  // Taken before the paper sees it: a press on the + is not the start of a
  // drag about the paper, nor of a box drawn to select with, and the click
  // is the + being pressed rather than the paper being clicked on.
  function plusAt(ev) {
    return byHand && ev.target && ev.target.closest ? ev.target.closest("#chart .plus") : null;
  }
  document.addEventListener("pointerdown", function (ev) {
    if (plusAt(ev)) { ev.stopPropagation(); }
  }, true);
  document.addEventListener("click", function (ev) {
    var plus = plusAt(ev);
    if (!plus) { return; }
    ev.stopPropagation();
    ev.preventDefault();
    plusMenu(+plus.dataset.i, plus.dataset.way, ev.clientX, ev.clientY);
  }, true);

  // ============================================ a step put into an arrow ==
  // A step forgotten between two that are already joined used to mean
  // deleting the arrow, adding the shape, and drawing two arrows again.
  // Now the arrow's own menu puts one in: the arrow goes into the new shape,
  // keeping its word (a decision's True stays True), and a new arrow takes
  // the flow on to where the old one went, keeping the side it came in at.
  // Where there is not room between the two, everything from the far one
  // on moves along to make some, as it would on paper.
  var INTO_KINDS = ["rect", "io", "diamond"];

  function stepMenu(linkId, x, y) {
    openMenu(x, y, [{ head: TXT.hp_what_in }].concat(INTO_KINDS.map(function (kind) {
      return { mark: keyMark(kind), name: kindName(kind),
               go: function () { stepInto(linkId, kind); } };
    })));
  }

  function stepInto(linkId, kind) {
    var link = linkById(linkId);
    var a = link && nodeById(link.from), b = link && nodeById(link.to);
    if (!a || !b || !byHand) { return; }
    keepUndo();
    var node = { id: hand.next++, kind: kind, text: firstWords(kind),
                 x: (a.x + b.x) / 2, y: (a.y + b.y) / 2, w: 140, h: 46 };
    measure(node);
    var ta = turned(a), tb = turned(b);
    var down = Math.abs(b.y - a.y) >= Math.abs(b.x - a.x);
    // Onward, down the page or across it: make room if there is not any.
    if (down && b.y > a.y) {
      var roomY = (b.y - tb.h / 2) - (a.y + ta.h / 2), needY = node.h + NEXT_GAP * 2;
      if (roomY < needY) { pushOn("y", b.y - tb.h / 2 - 0.5, needY - roomY); }
      node.y = (a.y + ta.h / 2 + b.y - tb.h / 2) / 2;
      node.x = Math.abs(a.x - b.x) < 1 ? a.x : node.x;
    } else if (!down && b.x > a.x) {
      var roomX = (b.x - tb.w / 2) - (a.x + ta.w / 2), needX = node.w + NEXT_GAP * 2;
      if (roomX < needX) { pushOn("x", b.x - tb.w / 2 - 0.5, needX - roomX); }
      node.x = (a.x + ta.w / 2 + b.x - tb.w / 2) / 2;
      node.y = Math.abs(a.y - b.y) < 1 ? a.y : node.y;
    }
    node.x = Math.round(node.x / HAND_GRID) * HAND_GRID;
    node.y = Math.round(node.y / HAND_GRID) * HAND_GRID;
    // An arrow back up the page, or anywhere else there was no room made:
    // the nearest clear place to where it would have gone.
    if (crowds(node, node.x, node.y)) {
      var spot = freeSpot(node, 40);
      if (spot) { node.x = spot.x; node.y = spot.y; }
    }
    hand.nodes.push(node);
    var onward = { from: node.id, to: b.id, label: kind === "diamond" ? TXT.yes : "" };
    ["dash", "color", "wide", "head"].forEach(function (key) {
      if (link[key] !== undefined) { onward[key] = link[key]; }
    });
    if (link.toSide) { onward.toSide = link.toSide; }
    link.to = node.id;
    delete link.toSide;                  // it goes somewhere else now
    delete link.pin;
    hand.links.push(onward);
    picked = node.id; chosen = null; many = [];
    drawHand(); drawHandPanel(); showReport();
    var g = el('.node[data-i="h' + node.id + '"]', chart);
    if (g) { typeInto(g); }
  }

  // Everything whose near edge is at or past `from`, moved along by `by`.
  function pushOn(axis, from, by) {
    var step = Math.ceil(by / HAND_GRID) * HAND_GRID;
    hand.nodes.forEach(function (n) {
      var t = turned(n);
      if (axis === "y" && n.y - t.h / 2 >= from) { n.y += step; }
      if (axis === "x" && n.x - t.w / 2 >= from) { n.x += step; }
    });
  }

  // ======================================================= lining them up ==
  // Several shapes taken up at once could be moved, copied and deleted
  // together, but not put straight: getting three boxes onto one line was
  // a matter of dragging each until the red guide showed.  So the lot can
  // be lined up by an edge or a middle, or spaced so the gaps between them
  // are all the same.  Lined up against the shapes themselves, not the
  // first one taken: the left edges go to the leftmost, the middles to the
  // middle of the lot.
  var LINE_UP = [
    ["left", "hl_left", "M2.5 1.5v13M5 5h8.5M5 11h5.5"],
    ["center", "hl_center", "M8 1.5v13M3 5h10M5 11h6"],
    ["right", "hl_right", "M13.5 1.5v13M2.5 5h8.5M5.5 11h5.5"],
    ["top", "hl_top", "M1.5 2.5h13M5 5v8.5M11 5v5.5"],
    ["middle", "hl_middle", "M1.5 8h13M5 3v10M11 5v6"],
    ["bottom", "hl_bottom", "M1.5 13.5h13M5 2.5v8.5M11 5.5v5.5"],
    ["across", "hl_across", "M1.5 3v10M14.5 3v10M8 5v6M4.75 6.5v3M11.25 6.5v3"],
    ["down", "hl_down", "M3 1.5h10M3 14.5h10M5 8h6M6.5 4.75h3M6.5 11.25h3"]
  ];

  function lineUpArt(d) {
    return '<svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" ' +
           'stroke-width="1.8" stroke-linecap="round" aria-hidden="true"><path d="' + d + '"/></svg>';
  }

  function lineShapesUp(ids, how) {
    var lot = ids.map(nodeById).filter(Boolean);
    if (lot.length < 2 || !byHand) { return; }
    if ((how === "across" || how === "down") && lot.length < 3) { return; }
    keepUndo();
    var boxes = lot.map(function (n) { return { n: n, t: turned(n) }; });
    var lo = Math.min.apply(null, boxes.map(function (b) { return b.n.x - b.t.w / 2; }));
    var hi = Math.max.apply(null, boxes.map(function (b) { return b.n.x + b.t.w / 2; }));
    var top = Math.min.apply(null, boxes.map(function (b) { return b.n.y - b.t.h / 2; }));
    var foot = Math.max.apply(null, boxes.map(function (b) { return b.n.y + b.t.h / 2; }));
    boxes.forEach(function (b) {
      if (how === "left") { b.n.x = lo + b.t.w / 2; }
      if (how === "right") { b.n.x = hi - b.t.w / 2; }
      if (how === "center") { b.n.x = (lo + hi) / 2; }
      if (how === "top") { b.n.y = top + b.t.h / 2; }
      if (how === "bottom") { b.n.y = foot - b.t.h / 2; }
      if (how === "middle") { b.n.y = (top + foot) / 2; }
    });
    // Spaced: the first and last stay put, and the gaps between neighbours
    // come out the same, whatever size each of them is.
    if (how === "across" || how === "down") {
      var across = how === "across", size = across ? "w" : "h", at = across ? "x" : "y";
      boxes.sort(function (p, q) { return p.n[at] - q.n[at]; });
      var start = boxes[0].n[at] - boxes[0].t[size] / 2;
      var end = boxes[boxes.length - 1].n[at] + boxes[boxes.length - 1].t[size] / 2;
      var filled = boxes.reduce(function (sum, b) { return sum + b.t[size]; }, 0);
      var gap = (end - start - filled) / (boxes.length - 1);
      var edge = start;
      boxes.forEach(function (b) {
        b.n[at] = edge + b.t[size] / 2;
        edge += b.t[size] + gap;
      });
    }
    boxes.forEach(function (b) {
      b.n.x = Math.round(b.n.x / HAND_GRID) * HAND_GRID;
      b.n.y = Math.round(b.n.y / HAND_GRID) * HAND_GRID;
    });
    drawHand(); drawHandPanel(); showReport();
  }

  // The eight buttons, as a row for the panel.
  function lineUpRow(ids) {
    var box = document.createElement("div");
    box.className = "line-up";
    var head = document.createElement("div");
    head.className = "line-up-head";
    head.textContent = TXT.hl_head;
    box.appendChild(head);
    var row = document.createElement("div");
    row.className = "line-up-row";
    LINE_UP.forEach(function (one) {
      var b = document.createElement("button");
      b.type = "button";
      b.className = "icon small";
      b.innerHTML = lineUpArt(one[2]);
      b.title = TXT[one[1]] || one[0];
      b.setAttribute("aria-label", b.title);
      b.disabled = (one[0] === "across" || one[0] === "down") && ids.length < 3;
      b.onclick = function () { lineShapesUp(ids, one[0]); };
      row.appendChild(b);
    });
    box.appendChild(row);
    return box;
  }

  // And as a strip of the menu the right button opens on them.
  function lineUpTools(ids) {
    return { tools: LINE_UP.filter(function (one) {
      return ids.length > 2 || (one[0] !== "across" && one[0] !== "down");
    }).map(function (one) {
      return { art: lineUpArt(one[2]), mark: "", name: TXT[one[1]] || one[0],
               go: function () { lineShapesUp(ids, one[0]); } };
    }) };
  }
