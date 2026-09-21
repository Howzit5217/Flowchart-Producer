// ---------------------------------------------------------------------------
//  11-hand-panel.js -- what the panel shows for a shape or an arrow
//
//  One part of the studio's script.  The parts run inside one function,
//  in the order parts.py lists them, and share everything between them.
// ---------------------------------------------------------------------------
  // ---- the panel side of it ---------------------------------------------
  function drawAdders() {
    var box = el("#adders");
    if (!box) { return; }
    box.innerHTML = "";
    handKinds().forEach(function (pair) {
      var b = document.createElement("button");
      b.className = "btn small";
      b.title = pair[1];
      b.setAttribute("aria-label", pair[1]);
      b.draggable = true;
      b.innerHTML = keyMark(pair[0]);
      b.onclick = function () { addNode(pair[0]); };
      // Dragged onto the paper it lands where it is dropped, which is what
      // anyone who has used a drawing program will try first.  Clicking it
      // still drops one below whatever is in hand, for anyone who would
      // rather not drag.
      b.ondragstart = function (ev) {
        ev.dataTransfer.setData("text/plain", pair[0]);
        ev.dataTransfer.effectAllowed = "copy";
        dragging_kind = pair[0];
      };
      b.ondragend = function () { dragging_kind = null; };
      box.appendChild(b);
    });
    paperTakesDrops();
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
    spot = spot.matrixTransform(frame.inverse());
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
    if (kind === "oval") {
      return hand.nodes.some(function (n) { return n.kind === "oval"; })
             ? TXT.end : TXT.start;
    }
    // A words-only box has no outline, so an empty one would be nothing at
    // all on the paper.  It arrives saying what it is, ready to be typed over.
    if (kind === "text") { return TXT.n_text || "Text"; }
    return "";
  }

  function drawHandPanel() {
    drawSelection();                     // the Style side is about it as well
    var box = el("#hand-sel");
    if (!box) { return; }
    box.innerHTML = "";
    var link = linkById(chosen);
    if (link) { return arrowPanel(box, link); }
    var node = nodeById(picked);
    if (!node) {
      box.innerHTML = '<p class="hint">' + TXT.pick_shape + "</p>";
      return;
    }
    var name = kindName(node.kind);
    var head = document.createElement("div");
    head.className = "what";
    head.style.cssText = "font-weight:600; margin:10px 0 6px";
    head.textContent = name;
    box.appendChild(head);

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
    };
    box.appendChild(words);

    var go = document.createElement("div");
    go.style.cssText = "display:flex; gap:8px; margin-top:10px";
    var join = document.createElement("button");
    join.className = "btn small" + (joining ? " primary" : "");
    join.textContent = joining ? TXT.connect_now : TXT.connect;
    join.onclick = function () { joining = !joining; drawHandPanel(); };
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
    var k = style.kinds[node.kind] || {};
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
      if (node.kind === "diamond" || outs.length > 1) {
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

  function joinUp(fromId, toId) {         // one shape leads to another
    if (!fromId || !toId || fromId === toId) { return; }
    var already = outOf(fromId).some(function (l) { return l.to === toId; });
    if (already) { return; }
    keepUndo();
    var from = nodeById(fromId);
    var tag = "";
    if (from && from.kind === "diamond") {
      tag = outOf(fromId).length ? TXT.no : TXT.yes;
    }
    hand.links.push({ from: fromId, to: toId, label: tag });
    joining = false;
    drawHand();
    drawHandPanel();
    showReport();
  }

  function linkById(id) {
    return hand.links.filter(function (l) { return l.id === id; })[0] || null;
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
    box.appendChild(switches);

    var go = document.createElement("div");
    go.style.cssText = "display:flex; gap:8px; margin-top:10px";
    var flip = document.createElement("button");
    flip.className = "btn small";
    flip.textContent = TXT.turn_it_round;
    flip.onclick = function () {
      var was = link.from; link.from = link.to; link.to = was;
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

  function handClick(id) {                // a shape was clicked on the chart
    chosen = null;
    if (joining && picked && picked !== id) {
      joinUp(picked, id);
      return;
    }
    picked = id;
    joining = false;
    drawHand();
    drawHandPanel();
    var g = el('.node[data-i="h' + id + '"]', chart);  // the color side of
    if (g) { select(g); }                              //   the panel follows
  }

